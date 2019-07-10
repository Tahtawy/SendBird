var app = angular.module('chatApp', []);
var appId = 'E67FADA9-7D27-44F9-994A-7A6883216BD8';
var appToken = 'bfde28616cc95883a5b0ef334be7c916d08bcf54';
var frontUser = {
  user_id: 'NewFrontUser',
  nickname: 'frontUser',
  profile_url: ''
};
var distinctGroup = null;

app.controller('chatCtrl', function ($scope) {
  $scope.onInit = function () {
    $scope.message = '';
    $scope.sentMessages = [];
    $scope.recieveMessages = [];

    // Init Server.
    var frontSDK = new SendBird({ appId: appId });

    // Create Chat Handeler.
    var ChannelHandler = new frontSDK.ChannelHandler();

    // Set Axios Token.
    axios.defaults.headers.common['Api-Token'] = appToken;

    // Handel Recieve Message.
    ChannelHandler.onMessageReceived = function (channel, message) {
      $scope.recieveMessages.push(message.message);
      $scope.$apply();
    };
    // Handel Recieve Invitation.
    ChannelHandler.onUserReceivedInvitation = function (groupChannel, inviter, invitees) {
      distinctGroup = groupChannel;
      groupChannel.acceptInvitation(function (response, error) {
        if (error) {
          console.log('error', error);
          return;
        }
        alert('success');
      });
    }
    frontSDK.addChannelHandler('onMessageReceived', ChannelHandler);

    // Create Front User.
    axios.post(`https://api-${appId}.sendbird.com/v3/users`, frontUser).then(function (response) {
      console.log(response);
    });

    // Connect To Server.
    frontSDK.connect('NewFrontUser', function (user, error) {
      if (error) {
        return;
      }
      console.log('connect');
    });
  }

  $scope.sendMessage = function () {
    distinctGroup.sendUserMessage($scope.message, function (message, error) {
      if (error) {
        return;
      }
      $scope.sentMessages.push(message.message);
      $scope.$apply();
    });
  }
});