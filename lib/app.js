/*
 * Angular app module
 *
 * Define behaviour for app `run` and `config`
 */

var api, auth, cfg, envCfg,
    challenges = require('./challenges/index'),
    summer = require('./challenges/summer_camp/index'),
    config = require('./core/config'),
    analytics = require('./core/analytics'),
    app = angular.module('draw', ['ngRoute']);

cfg = angular.extend(config.default, config[window.ENV]);

envCfg = {
    API_URL     : cfg.API_URL,
    WORLD_URL   : cfg.WORLD_URL,
    OFFLINE     : cfg.OFFLINE
};

auth = require('./core/auth')(envCfg);
api = require('./api')(envCfg);

window.CONFIG = cfg;

// Configure app
app.config(function ($locationProvider) {
    $locationProvider.html5Mode(true);
});



// Run app
app.run(function ($rootScope, $window) {
    var win = angular.element($window);

    // Define global app initial values
    $rootScope.challenges = challenges;
    $rootScope.summerChallenges = summer;
    $rootScope.progress = {};
    $rootScope.progress.groups = {};
    $rootScope.cfg = cfg;
    $rootScope.api = api;
    $rootScope.offline = cfg.OFFLINE;
    $rootScope.loggedIn = false;
    $rootScope.user = null;
    $rootScope.login = auth.login;
    $rootScope.logout = auth.logout;
    $rootScope.shutdown = api.server.shutdown;

    // Prefill progress from localStorage
    $rootScope.progress.challengeNo = parseInt(localStorage.challenge || 0, 10);
    $rootScope.progress.groups = localStorage.groups ? JSON.parse(localStorage.groups) : {};

    function summerCampStarted()  {
        var diff = new Date() - new Date('2015-08-10T06:00:00');
        return diff > 0;
    }

    /**
     * Loads the user profile inside the $rootScope
     * @param  {string} userId the UserId
     */
    function loadUserProfile(userId) {
        api.profile.getProfile({userId: userId}).then(function (res) {
            var user = (res && res.body) ? res.body.user : undefined;
            if (user) {
                $rootScope.user.profile = user.profile;
            }
            $rootScope.$broadcast('user-profile-loaded');

        });
    }

    $rootScope.summerCampStarted = summerCampStarted();


    // Initialised auth state
    auth.init(function () {
        var userObj, userId;

        $rootScope.loggedIn = auth.getState();
        userObj = auth.getUser();
        $rootScope.user = userObj;

        if (userObj) {
            loadUserProfile(userObj.id);
        }

        $rootScope.$watch('user', function (user) {
            if (user) {
                userId = user.id;
                if (!localStorage.uuid) {
                    localStorage.uuid = userId;
                    loadUserProfile(userId);
                } else {
                    if (localStorage.uuid !== userId) {
                        localStorage.uuid = userId;
                    }
                }
            }
        });


        // Load progress
        api.progress.load(function (challengeNo, groups) {
            $rootScope.progress.challengeNo = challengeNo || 1;
            if (groups) {
                $rootScope.progress.groups = groups;
            }
            $rootScope.$apply();
        });

    });

    // Initialise analytics
    analytics.init();

    /*
     * Get last visited challenge index
     *
     * @return {Number}
     */
    function getLastChallenge(groupName) {
        if (groupName) {
            return parseInt(localStorage[groupName + 'lastChallengeVisited'] || 1, 10);
        }
        return parseInt(localStorage.lastChallengeVisited || 1, 10);
    }

    /*
     * Set last visited challenge index
     *
     * @param {Number} index
     * @return void
     */
    function setLastChallenge(index, groupName) {
        if (groupName) {
            localStorage[groupName + 'lastChallengeVisited'] = index;
        }
        else {
            localStorage.lastChallengeVisited = index;
        }
    }

    /*
     * Attach lastChallengeVisited get / set object to $rootScope
     */
    $rootScope.lastChallengeVisited = {
        get : getLastChallenge,
        set : setLastChallenge
    };

    /*
     * Update progress
     *
     * @param {Number} challengeNo
     * @return void
     */
    $rootScope.updateProgress = function (challengeNo, groupName) {
      	  return; //return before any updatin of XP is sent back....
	  if (groupName) {
            api.progress.save(challengeNo, groupName, function(xpGain) {
                $rootScope.xpGain = xpGain;
                $rootScope.$apply();
            });
            $rootScope.progress.groups = {};
            $rootScope.progress.groups[groupName] = {};
            $rootScope.progress.groups[groupName].challengeNo = challengeNo;
        }
        else if (challengeNo > $rootScope.progress.challengeNo) {
            api.progress.save(challengeNo, null, function(xpGain) {
                $rootScope.xpGain = xpGain;
                $rootScope.$apply();
            });
            $rootScope.progress.challengeNo = challengeNo;
            $rootScope.$apply();

        } else {
            $rootScope.xpGain = 0;
            $rootScope.$apply();
        }
    };

    // Listen for key press
    win.bind('keydown', function (e) {
        if (e.keyCode === 27) {
            $rootScope.$apply();
        }
    });


    // Update basePath on route change
    $rootScope.$on('$routeChangeSuccess', function (e, route) {
        var path = route.$$route ? route.$$route.originalPath : null;
        $rootScope.basePath = path ? path.split('/')[1] : '';
        analytics.page(path);
    });
});

module.exports = app;
