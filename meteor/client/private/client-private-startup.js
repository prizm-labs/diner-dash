/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function() {
    Meteor.loginWithFacebook({
        requestPermissions: ['publish_actions']
    }, function (err) {
        if (err) {
            Session.set('errorMessage', err.reason || 'Unknown error');
        }
    });
});