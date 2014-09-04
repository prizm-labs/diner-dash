/**
 * Created by michaelgarrido on 9/4/14.
 */
Meteor.startup(function () {
    Accounts.loginServiceConfiguration.remove({
        service: "facebook"
    });

    Accounts.loginServiceConfiguration.insert({
        service: "facebook",
        appId: 697413780331229,
        secret: "ed58a86e0c972fef62b79e324e26a10d"
//        appId: process.env.FACEBOOK_APP_ID,
//        secret: process.env.FACEBOOK_APP_SECRET
    });
});