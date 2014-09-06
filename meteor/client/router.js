/**
 * Created by michaelgarrido on 9/4/14.
 */
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});


Router.map(function() {


    // Public Screen
    // vertical HDTV, horizontal IPS monitor, etc.
    // (i.e. for 3D Game Board)

    this.route('private', {
        path: '/',
        action: function () {
            this.render();
        },
        data: function () {
            return {
                lobbies: Lobbies.find().fetch(),
                games: Games.find().fetch()
            }
        },
        onAfterAction: function () {

        },
        onRun: function () {

        }
    });

    // Private Screen
    // smartphone, tablet, or laptop

    this.route('public', {
        path: '/public',
        action: function () {

            this.render();

        },
        data: function () {
            return {
                lobbies: Lobbies.find().fetch(),
                games: Games.find().fetch()
            }
        },
        onAfterAction: function () {

        },
        onRun: function () {

        }
    });

});
