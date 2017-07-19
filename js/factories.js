angular.module("git.factories", [])
.value("api.git", { 
    repos: "https://api.github.com/users/{user}/repos", 
    search: "https://api.github.com/search/repositories" 
})
.factory("menu.factory", ["$location", function($location) {
    var menu = {
        items: {
            "/registro": {
                titulo: "Registro Usuario",
            },
            "/repos": {
                titulo: "Repositorios",
            }
        },
        getCurrent: function() {
            return this.items[$location.path()];
        }
    };
    angular.forEach(menu.items, function(v, k) { 
        var _items = this;
        this[k].active = function () { return k == $location.path(); };
        this[k].activeClass = function () { return _items[k].active() ? "active" : ""; };
        this[k].href = "#" + k; 
    }, menu.items);
    return menu;
}])
.factory("repos.factory", ["$q", "$http", "api.git", function($q, $http, apiGit) {
    var repos = {
        getUrlRepos: function(usuario) { return apiGit.repos.replace("{user}", usuario); },
        getPromise: function(url, params) {
            var defered = $q.defer();
            $http.get(url, params).success(defered.resolve).error(defered.reject);
            return defered.promise;
        },
        getRepos: function (usuario) {
            return this.getPromise(this.getUrlRepos(usuario)).then(this.thenRepos);
        },
        getReposPag: function (usuario, tamPag, pagina) {
            return this.getPromise(this.getUrlRepos(usuario), { params: { page: pagina || 1, per_page: tamPag }}).then(this.thenRepos);
        },
        getSearchRepos: function(search, tamPag) {
            return this.getPromise(apiGit.search, { params: { q: search, page: 1, per_page: tamPag }}).then(function(data) { return data.items; }).then(this.thenRepos);
        },
        thenRepos: function(data) {
            var items = []; 
            angular.forEach(data, function(v) { items.push({ lenguaje: v.language, branch: v.default_branch, url: v.url, nombre: v.name, descripcion: v.description }); });
            return items;
        },
        getPaginacion: function(items, tamPag) {
            var result = { };
            if (items.length > tamPag) {
                result.paginas = [];
                var numPaginas = Math.floor(items.length / tamPag) + 1;
                var pag = 1; 
                while (pag < numPaginas) {
                    result.paginas.push(pag);
                    pag++;
                }
            } 
            else { result.items = items; } 
            return result;
        }
    };
    return repos;
}])
.directive("searchRepo", ["repos.factory", function(repos) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.bind("propertychange keyup paste", function() {
                if (element.val().length >= 3) {
                    // repos.getSearchRepos(element.val(), 5).then(function(data) { scope.items = data; });
                    console.log(element.val())
                    repos.getReposPag(scope.$parent.usuario.usuarioGit, 5, 1)
                    .then(function(data) {
                        var items = [];
                        var reg = new RegExp(element.val(), "ig");
                        angular.forEach(data, function (v) { 
                            if (reg.test(v.nombre) || reg.test(v.language) || reg.test(v.branch) || reg.test(v.url) || reg.test(v.descripcion)) 
                            items.push(v); 
                        }); 
                        scope.items = items;
                        scope.paginas = null; 
                    });
                }
                if (element.val().length == 0) {
                    scope.getRepos();
                }
            });
        }
    };
}]);