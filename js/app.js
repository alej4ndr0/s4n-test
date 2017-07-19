angular.module("git.app", ["git.controllers", "ngRoute"])
.config(function ($routeProvider, $locationProvider) {
    $routeProvider
    .when('/registro', {
        templateUrl: 'templates/registro.html',
        controller: 'registro.controller',
    })
    .when('/repos', {
        templateUrl: 'templates/repos.html',
        controller: 'repos.controller',
        // controllerAs: "repos"
    })
    .otherwise("/registro");
    // $locationProvider.hashPrefix("!");
});