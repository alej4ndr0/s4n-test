angular.module("git.controllers", ["ngCookies", "git.factories"])
.value("campos", ["nombres", "apellidos", "cedula", "correo", "usuarioGit"])
.value("repos.columnas", { "lenguaje": "lenguaje", "branch": "Branch", "url": "Url Git", "nombre": "Nombre", "descripcion": "Descripción" })
.controller("ppal.controller", ["$cookies", "$scope", "menu.factory", "campos", "$location", "$route", function($cookies, $scope, menu, campos, $location, $route) {
    $scope.header = "templates/header.html";
    $scope.menu = menu.items;
    $scope.subtitulo = function () { return menu.getCurrent().titulo; };
    $scope.usuario = $cookies.getObject($cookies.get("usuario"));
    $scope.campos = campos;
    $scope.lstUsuarios = $cookies.getObject("lstUsuarios");
    $scope.seleccionarUsuario = function (usuarioGit) {
        usuarioGit && $cookies.put("usuario", usuarioGit);
        $scope.usuario = $cookies.getObject($cookies.get("usuario"));
        if ($location.path() == "/repos") {
            $route.reload();
        }
    }
    $scope.quitarUsuario = function () {
        var lstUsuarios = $cookies.getObject("lstUsuarios") || {};
        if (lstUsuarios && lstUsuarios[$scope.usuario.usuarioGit]) {
            delete lstUsuarios[$scope.usuario.usuarioGit];
            $cookies.putObject("lstUsuarios", lstUsuarios);
        }
        $cookies.remove($scope.usuario.usuarioGit);
        $scope.seleccionarUsuario("-1");
    }
    $scope.seleccionarUsuario();
}])
.controller("registro.controller", ["$scope", "$cookies", "campos", "$location", function ($scope, $cookies, campos, $location) {
    var ppal = $scope.$parent;
    $scope.registrar = function () {
        var usuario = {};
        angular.forEach(campos, function (v) { usuario[v] = $scope[v]; });
        $cookies.putObject($scope.usuarioGit, usuario);
        $cookies.put("usuario", $scope.usuarioGit);
        var lstUsuarios = $cookies.getObject("lstUsuarios") || {};
        lstUsuarios[$scope.usuarioGit] = $scope.usuarioGit;
        $cookies.putObject("lstUsuarios", lstUsuarios);
        ppal.seleccionarUsuario();
        ppal.lstUsuarios = $cookies.getObject("lstUsuarios");
        angular.forEach(campos, function (v) { $scope[v] = ""; });
        $location.path("/repos")
    };
    $scope.puedeRegistrar = function () {
        var puedeRegistrar = true;
        angular.forEach(campos, function(v) { puedeRegistrar = puedeRegistrar && $scope[v]; });
        return puedeRegistrar;
    }
}])
.controller("repos.controller", ["$scope", "repos.factory", "repos.columnas",  function ($scope, repos, columnas) {
    var ppal = $scope.$parent;
    var tamPag = 5;
    $scope.columnas = {};
    angular.forEach(columnas, function(v, k) { this[k] = { titulo: v, columna: k } }, $scope.columnas);
    $scope.getRepos = function() {
        if (ppal.usuario) {
            repos.getRepos(ppal.usuario.usuarioGit).then(function(data) {
                var paginacion = repos.getPaginacion(data, tamPag);
                $scope.paginas = paginacion.paginas;
                $scope.irPagina(1);
            });
        }
    };
    $scope.irPagina = function(pagina) {
        $scope.pagina = pagina;
        repos.getReposPag(ppal.usuario.usuarioGit, tamPag, $scope.pagina).then(function(data) { $scope.items = data; });
    };
    $scope.ordenar = function(columna) {
        $scope.orden = columna;
        $scope.ordenReverse = $scope.ordenReverse || [];
        $scope.ordenReverse[columna] = !($scope.ordenReverse[columna]); 
    };
    $scope.getRepos();
}])