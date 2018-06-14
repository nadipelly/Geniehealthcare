var app = angular.module('careGiversApp', [
            'ngStorage',
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngCacheBuster',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.bootstrap.datetimepicker',
            'ui.router',
            'infinite-scroll',
			'btorfs.multiselect', 
			'ngSanitize',
            'angular-loading-bar'
        ]);
		
app.config(['$urlRouterProvider', '$stateProvider',
    function($urlRouterProvider, $stateProvider) {
      $stateProvider
        .state('home', {
          url: '/',
          views: {
                'content@': {
                    templateUrl: '/index.html',
                    controller: 'CareGiversController',
                    controllerAs: 'vm'
                }
            }
        })
		.state('candidate-profile-from-lead-source', {
            url: '/candidate-profile-from-lead-source',
            data: {
            },
            views: {
                'content@': {
                    templateUrl: '/index.html',
                    controller: 'CareGiversController',
                    controllerAs: 'vm'
                }
            }
        });
    }
  ]);		

(function() {
    'use strict';

    angular
        .module('careGiversApp')
        .factory('DateUtils', DateUtils);

    DateUtils.$inject = ['$filter'];

    function DateUtils($filter) {

        var service = {
            convertDateTimeFromServer: convertDateTimeFromServer,
            convertLocalDateFromServer: convertLocalDateFromServer,
            convertLocalDateToServer: convertLocalDateToServer,
            convertDateToServer: convertDateToServer,
            dateformat: dateformat
        };

        return service;

        function convertDateTimeFromServer(date) {
            if (date) {
                return new Date(date);
            } else {
                return null;
            }
        }
        
        function convertDateToServer(date) {
            if (date) {
                return ($filter('date')(date, 'yyyy-MM-dd') + " 00:00:00");
            } else {
                return null;
            }
        }

        function convertLocalDateFromServer(date) {
            if (date) {
                var dateString = date.split('-');
                return new Date(dateString[0], dateString[1] - 1, dateString[2]);
            }
            return null;
        }

        function convertLocalDateToServer(date) {
            if (date) {
                return $filter('date')(date, 'yyyy-MM-dd');
            } else {
                return null;
            }
        }

        function dateformat() {
            return 'yyyy-MM-dd';
        }
    }

})();

(function() {
    'use strict';

    angular
        .module('careGiversApp')
        .factory('CandidateProfessionSearch', CandidateProfessionSearch);

    CandidateProfessionSearch.$inject = ['$resource'];

    function CandidateProfessionSearch($resource) {
        var resourceUrl =  'http://geniejobportal-test-nadipelly.boxfuse.io/api/candidate-professions/getAllCandidateProfessions';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true}
        });
    }
})();

(function() {
    'use strict';

    angular
        .module('careGiversApp')
        .factory('CandidateSpecialtySearch', CandidateSpecialtySearch);

    CandidateSpecialtySearch.$inject = ['$resource'];

    function CandidateSpecialtySearch($resource) {
        var resourceUrl =  'http://geniejobportal-test-nadipelly.boxfuse.io/api/candidate-specialties/getAllCandidateSpecialties';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true}
        });
    }
})();

(function() {
    'use strict';

    angular
        .module('careGiversApp')
        .factory('CandidateLeadSourceSearch', CandidateLeadSourceSearch);

    CandidateLeadSourceSearch.$inject = ['$resource'];

    function CandidateLeadSourceSearch($resource) {
        var resourceUrl =  'http://geniejobportal-test-nadipelly.boxfuse.io/api/candidate-lead-sources/getAllCandidateLeadSources';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true}
        });
    }
})();

(function() {
    'use strict';

    angular
        .module('careGiversApp')
        .factory('StateSearch', StateSearch);

    StateSearch.$inject = ['$resource'];

    function StateSearch($resource) {
        var resourceUrl =  'http://geniejobportal-test-nadipelly.boxfuse.io/api/states/getAllStates';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true}
        });
    }
})();

(function() {
    'use strict';

    angular
        .module('careGiversApp')
        .factory('CandidateSpecialtySearchByProfession', CandidateSpecialtySearchByProfession);

    CandidateSpecialtySearchByProfession.$inject = ['$resource'];

    function CandidateSpecialtySearchByProfession($resource) {
        var resourceUrl =  'http://geniejobportal-test-nadipelly.boxfuse.io/api/candidate-specialties/get-all-by-profession/:profid';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true}
        });
    }
})();


app.factory('CandidateProfile', ['$resource', 'DateUtils', function CandidateProfile ($resource, DateUtils) {
        var resourceUrl =  'http://geniejobportal-test-nadipelly.boxfuse.io/api/candidate-profiles/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                        data.availableToStart = DateUtils.convertDateTimeFromServer(data.availableToStart);
                        data.dateCreated = DateUtils.convertDateTimeFromServer(data.dateCreated);
                        data.dateModified = DateUtils.convertDateTimeFromServer(data.dateModified);
                    }
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }]);

app.controller('CareGiversController', ['$timeout', '$http', '$scope', '$stateParams', 'CandidateProfile','CandidateProfessionSearch', 'CandidateSpecialtySearch', 'CandidateLeadSourceSearch', 'StateSearch', 'CandidateSpecialtySearchByProfession', function($timeout, $http, $scope, $stateParams, CandidateProfile, CandidateProfessionSearch, CandidateSpecialtySearch, CandidateLeadSourceSearch, StateSearch, CandidateSpecialtySearchByProfession) {
        $scope.candidateProfile = null;
        $scope.clear = clear;
        $scope.datePickerOpenStatus = {};
        $scope.openCalendar = openCalendar;

        $scope.save = save;
        $scope.candidateprofessions = CandidateProfessionSearch.query();
        $scope.candidatespecialties = null;
        $scope.candidateleadsources = CandidateLeadSourceSearch.query();
        $scope.states = StateSearch.query();
        $scope.refreshSpecialties = refreshSpecialties;
        $scope.leadSourceExists = false;
        $scope.notSubmitted =true;
        $scope.alreadyExists = false;
        $scope.alreadyExistsMessage = "";
        
        load();
        
        function load()
        {
        	$scope.leadSourceExists = true;
       
        	var url = $scope.leadSourceExists ? 
        			"http://geniejobportal-test-nadipelly.boxfuse.io/api/candidate-profiles/-999"
        			: "http://geniejobportal-test-nadipelly.boxfuse.io/api/candidate-profiles/-1000";

		    $http.get(url).then(function(response) {
				$scope.candidateProfile = response.data;
				$scope.candidateProfile.availableToStart = (response.data.availableToStart == null || response.data.availableToStart == "") ? null : new Date (response.data.availableToStart);
				console.log("$scope.candidateProfile is : " + JSON.stringify($scope.candidateProfile));
		    });
        }
        
		function refreshSpecialties()
		{
			if ($scope.candidateProfile.candidateProfessionId == null || $scope.candidateProfile.candidateProfessionId == '') return;
			
	        $scope.candidatespecialties = CandidateSpecialtySearchByProfession.query({"profid" : $scope.candidateProfile.candidateProfessionId}, onSpecialtySearchSuccess, onSpecialtySearchError);
	        
            function onSpecialtySearchSuccess(data, headers) {
            	$scope.candidatespecialties = data;
            }
            
            function onSpecialtySearchError(error) {
                AlertService.error(error.data.message);
            }
		}
        
        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            $scope.isSaving = true;
            $scope.notSubmitted = true;
            $scope.candidateProfile.candidateLeadSourceId = 1;
            if ($scope.candidateProfile.id !== null) {
                CandidateProfile.update($scope.candidateProfile, onSaveSuccess, onSaveError);
            } else {
                CandidateProfile.save($scope.candidateProfile, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (data, headers) {
            $scope.$emit('genieJobPortalApp:candidateProfileUpdate', data);
            //$uibModalInstance.close(result);
            var headerVal = headers('X-genieJobPortalApp-alert');
            
            if (headerVal.startsWith("You are already in"))
            {
            	$scope.alreadyExists = true;
            	$scope.alreadyExistsMessage = headerVal;
            }
            
            $scope.isSaving = false;
            $scope.notSubmitted = false;
        }

        function onSaveError () {
            $scope.isSaving = false;
            $scope.notSubmitted = true;
        }

        $scope.datePickerOpenStatus.availableToStart = false;

        $scope.datePickerOpenStatus.dateCreated = false;
        $scope.datePickerOpenStatus.dateModified = false;

        function openCalendar (date) {
            $scope.datePickerOpenStatus[date] = true;
        }
	
}]);
