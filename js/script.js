
var jsonDiscovererServices = angular.module("jsonDiscoverer.service", []);

var jsonDiscovererDirectives = angular.module("jsonDiscoverer.directive", []);
    
var jsonDiscovererFilters = angular.module("jsonDiscoverer.filter", []);

var jsonDiscovererModule = angular.module("jsonDiscoverer", ["ngSanitize", "jsonDiscoverer.service", "jsonDiscoverer.directive", "jsonDiscoverer.filter", "ui.bootstrap"])

jsonDiscovererModule.config(["$routeProvider", "$httpProvider", 
    function($routeProvider, $httpProvider) {
        $routeProvider.
            when("/", {
                templateUrl : "partials/main.html",
                controller : "IndexCtrl"
            }).
            when("/simple", {
                templateUrl : "partials/simple.html",
                controller : "SimpleDiscovererCtrl"
            }).
            when("/advanced", {
                templateUrl : "partials/advanced.html",
                controller : "AdvancedDiscovererCtrl"
            }).
            when("/contact", {
                templateUrl : "partials/contact.html",
                controller : "ContactCtrl"
            }).
            when("/composer", {
                templateUrl : "partials/composition.html",
                controller : "CompositionCtrl"
            }).
            otherwise({redirectTo: "/"});
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
        $httpProvider.defaults.useXDomain = true;
    }
]);

jsonDiscovererModule.controller("ContactCtrl", ["$scope", "$window", "$location",
    function($scope, $window, $location) {
        $scope.$on('$viewContentLoaded', function(event) {
            $window.ga('send', 'pageview', {'page': $location.path()});    
        });
    }
]);

jsonDiscovererModule.controller("IndexCtrl", ["$scope", "$window", "$location",
    function($scope, $window, $location) {
        $scope.$on('$viewContentLoaded', function(event) {
            $window.ga('send', 'pageview', {'page': $location.path()});    
        });
    }
]);

jsonDiscovererModule.controller("SimpleDiscovererCtrl", ["$scope", "$http", "$window", "$location" ,"$log", 
    function($scope, $http, $window, $location, $log) {
        $scope.json = { text: '' };
        $scope.metamodel = "";
        $scope.model = "";
        $scope.showTitles = false;
        $scope.url = ""

        $scope.$on('$viewContentLoaded', function(event) {
            $window.ga('send', 'pageview', {'page': $location.path()});   
        });

        $scope.alertsGeneral = [ ];
        $scope.alertsSchema = [ ];
        $scope.alertsData = [ ];

        $scope.closeGeneralAlert = function(index) {
            $scope.alertsGeneral.splice(index, 1);
        };

        $scope.closeSchemaAlert = function(index) {
            $scope.alertsSchema.splice(index, 1);
        };

        $scope.closeDataAlert = function(index) {
            $scope.alertsData.splice(index, 1);
        };

        $scope.discover = function() {
            discoverMetamodel($scope.json.text);
            injectModel($scope.json.text);
            $scope.showTitles = true;
        }

        $scope.example = function() {
            $scope.json = { text : '[\n   {\n      "sens":2,\n      "terminus":"Gare de Pont-Rousseau",\n      "temps":"Closest",\n      "ligne":{\n         "numLigne":"2",\n         "typeLigne":1\n      },\n      "arret":{\n         "codeArret":"CRQU2"\n      }\n   }\n]'};        }

        var discoverMetamodel = function(jsonText) {
            $scope.metamodel = "images/loading.gif";

            var dataToSend = $.param( {
                json : jsonText
            });

            $http({
                    method : 'POST',
                    //url : "http://apps.jlcanovas.es/jsonDiscoverer/discoverMetamodel",
                    url : "http://localhost:8080/fr.inria.atlanmod.json.web/discoverMetamodel",
                    data : dataToSend,
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data) {
                    $scope.metamodel = "data:image/jpg;base64," + data;
                    $scope.alertsGeneral.push({ type: 'warning', msg: 'Did you expect other schema? Please <a href="http://atlanmod.github.io/json-discoverer/#/contact">contact us</a> to improve our tool!' });
                }).error(function(data, status, headers, config) {
                    $scope.metamodel = "";
                    $scope.alertsSchema.push({ type: 'error', msg: 'Oops, we found an error in the discovery process. Could you check your JSON and try again?' });
                });
        }

        var injectModel = function(jsonText) {
            $scope.model = "images/loading.gif";

            var dataToSend = $.param( {
                json : jsonText
            });
            
            $http({
                    method : 'POST',
                    //url : "http://apps.jlcanovas.es/jsonDiscoverer/injectModel",
                    url : "http://localhost:8080/fr.inria.atlanmod.json.web/injectModel",
                    data : dataToSend,
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data) {
                    $scope.model = "data:image/jpg;base64," + data;
                }).error(function(data, status, headers, config) {
                    $scope.model = "";
                    $scope.alertsData.push({ type: 'error', msg: 'Oops, we found an error in the discovery process. Could you check your JSON and try again?' });
                });
        }

        $scope.obtainJSON = function() {
            delete $http.defaults.headers.common['X-Requested-With'];
            $http.defaults.useXDomain = true;

            var dataToSend = $.param( {
                url : $scope.url
            });
        
            $http({
                method : 'POST',
                //url : "http://apps.jlcanovas.es/jsonDiscoverer/getJson",
                url : "http://localhost:8080/fr.inria.atlanmod.json.web/getJson",
                data : dataToSend,
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data) {
                $scope.json.text = JSON.stringify(data);
            }).error(function(data, status, headers, config) {
                $scope.url = "";
                $scope.alertsGeneral.push({ type: 'error', msg: 'We could not get anything from that URL. Could you try again?' });
            });
        }
    }
]);

jsonDiscovererModule.controller("AdvancedDiscovererCtrl", ["$scope", "$rootScope", "$modal", "$http", "$window", "$location","$log",
    function($scope, $rootScope, $modal, $http, $window, $location, $log) {
        $scope.defs = {} ;
        $scope.discoveryPosible = false;
        $scope.name = "";
        $scope.metamodel = "";
        $scope.showTitles = false;

        $scope.alertsGeneral = [ ];

        $scope.$on('$viewContentLoaded', function(event) {
            $window.ga('send', 'pageview', {'page': $location.path()});   
        });

        $scope.defsNumber = function() {
            return Object.keys($scope.defs);
        };

        $scope.updateDiscoveryPosible = function() {
            if(typeof defs === "undefined") $scope.discoveryPosible = false;
            for(def in $scope.defs) {
                if($scope.defs[def].jsonDefs.length == 0) $scope.discoveryPosible = false;
            }
            $scope.discoveryPosible = true;
        };

        $scope.closeGeneralAlert = function(index) {
            $scope.alertsGeneral.splice(index, 1);
        };

        $scope.newSource = function() {
            $scope.defs[$scope.name] = { name : $scope.name, jsonDefs : [] };
            $scope.name = "";
        };

        $scope.provideJson = function (jsonName) {
            var modalInstance = $modal.open({
                templateUrl: 'jsonProvisionModal.html',
                controller: JsonProvisionModalInstanceCtrlVar,
                resolve: {
                    jsonName : function() {
                        return jsonName;
                    }}
            });

            modalInstance.result.then(
                function(data) {
                    $scope.defs[data.name]["jsonDefs"].push(data.text);
                    $scope.updateDiscoveryPosible();
                }, 
                function(data) {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
        };

        $scope.discover = function() {
            $scope.metamodel = "images/loading.gif";
            $scope.showTitles = true;

            var dataToSend = $.param({ sources : $scope.defs });

            $http({
                    method : 'POST',
                    //url : "http://apps.jlcanovas.es/jsonDiscoverer/compose",
                    url : "http://localhost:8080/fr.inria.atlanmod.json.web/compose",
                    data : dataToSend,
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data) {
                    $scope.metamodel = "data:image/jpg;base64," + data;
                    $scope.alertsGeneral.push({ type: 'warning', msg: 'Did you expect other schema? Please <a href="http://atlanmod.github.io/json-discoverer/#/contact">contact us</a> to improve our tool!' });
                }).error(function(data, status, headers, config) {
                    $scope.metamodel = "";
                    $scope.alertsGeneral.push({ type: 'error', msg: 'Oops, we found an error in the discovery process. Could you check your JSON and try again?' });
                });
        }
    }
]);

var JsonProvisionModalInstanceCtrlVar = function($scope, $modalInstance, $log, jsonName) {
    $scope.json = { name: jsonName, text: '' };

    $scope.ok = function() {
        $modalInstance.close({ name : jsonName, text: $scope.json.text });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}

var JsonProvisionModalWithInputInstanceCtrlVar = function($scope, $modalInstance, $log, jsonName) {
    $scope.json = { name: jsonName, input: '', output: '' };

    $scope.ok = function() {
        $modalInstance.close({ name : jsonName, input: $scope.json.input, output: $scope.json.output });
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}

jsonDiscovererModule.controller("CompositionCtrl", ["$scope", "$window", "$location", "$modal", "$http",
    function($scope, $window, $location, $modal, $http) {
        $scope.defs = {} ;
        $scope.compositionPosible = false;
        $scope.name = "";
        $scope.graph = "";

        $scope.sigmaGraph = new sigma('sigma-container');
        $scope.layoutButton = "Start Layout";
        $scope.layoutRunning = false;

        $scope.alertsGeneral = [ ];

        $scope.$on('$viewContentLoaded', function(event) {
            $window.ga('send', 'pageview', {'page': $location.path()});
        });


        $scope.newSource = function() {
            $scope.defs[$scope.name] = { name : $scope.name, jsonDefs : [] };
            $scope.name = "";
        };

        $scope.provideJson = function (jsonName) {
            var modalInstance = $modal.open({
                templateUrl: 'jsonProvisionModalWithInput.html',
                controller: JsonProvisionModalWithInputInstanceCtrlVar,
                resolve: {
                    jsonName : function() {
                        return jsonName;
                    }}
            });

            modalInstance.result.then(
                function(data) {
                    $scope.defs[data.name]["jsonDefs"].push({ "input" : data.input, "output" : data.output});
                    $scope.updateCompositionPosible();
                },
                function(data) {
                    //$log.info('Modal dismissed at: ' + new Date());
                });
        };

        $scope.closeGeneralAlert = function(index) {
            $scope.alertsGeneral.splice(index, 1);
        };

        $scope.discoverComposition = function() {
            $scope.metamodel = "images/loading.gif";

            var dataToSend = $.param({ sources : $scope.defs });

            $http({
                method : 'POST',
                //url : "http://apps.jlcanovas.es/jsonDiscoverer/compose",
                url : "http://localhost:8080/fr.inria.atlanmod.json.web/discoverComposition",
                data : dataToSend,
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(data) {
                var dataDom = new DOMParser().parseFromString(data, "application/xml");
                var mygexf = GexfParser.parse(dataDom);
                console.log("nodes " + mygexf.nodes.length);

                $scope.sigmaGraph.graph.clear();
                var i, l, arr, obj, node;

                // Adapt the graph:
                arr = mygexf.nodes;
                for (i = 0, l = arr.length; i < l; i++) {
                    obj = arr[i];
                    $scope.sigmaGraph.graph.addNode({
                        id: obj.id,
                        label : obj.label,
                        x : Math.random(),
                        y : Math.random(),
                        size : 1,
                        color : obj.viz.color
                    })
                }

                arr = mygexf.edges;
                for (i = 0, l = arr.length; i < l; i++) {
                    obj = arr[i];
                    $scope.sigmaGraph.graph.addEdge({
                        id: obj.id,
                        source : obj.source,
                        target : obj.target
                    })
                }
                $scope.sigmaGraph.refresh();

            }).error(function(data, status, headers, config) {
                $scope.metamodel = "";
                $scope.alertsGeneral.push({ type: 'error', msg: 'Oops, we found an error in the composition discovery process. Could you check your JSON and try again?' });
            });
        };


        $scope.updateCompositionPosible = function() {
            if(typeof defs === "undefined") $scope.compositionPosible = false;
            for(def in $scope.defs) {
                if($scope.defs[def].jsonDefs.length == 0) $scope.compositionPosible = false;
            }
            $scope.compositionPosible = true;
        };

        $scope.layout = function() {
            if($scope.layoutRunning) {
                $scope.layoutRunning = false;
                $scope.layoutButton = 'Start Layout';
                $scope.sigmaGraph.stopForceAtlas2();
            } else {
                $scope.layoutRunning = true;
                $scope.layoutButton = 'Stop Layout';
                $scope.sigmaGraph.startForceAtlas2();
            }
        };

        $scope.rescale = function() {
            $scope.sigmaGraph.position(0,0,1).draw();
        };

    }
]);