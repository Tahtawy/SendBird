var app = angular.module('chatApp', []);
var appId = 'E67FADA9-7D27-44F9-994A-7A6883216BD8';
var appToken = 'bfde28616cc95883a5b0ef334be7c916d08bcf54';
var mobileUser = {
  user_id: 'NewMobileUser',
  nickname: 'mobileUser',
  profile_url: ''
};
var distinctGroup = null;

app.controller('chatCtrl', function ($scope) {
  $scope.onInit = function () {
    $scope.message = '';
    $scope.sentMessages = [];
    $scope.recieveMessages = [];

    // Init Server.
    var mobileSDK = new SendBird({ appId: appId });

    // Create Chat Handeler.
    var ChannelHandler = new mobileSDK.ChannelHandler();

    // Handel Recieve Message.
    ChannelHandler.onMessageReceived = function (channel, message) {
      $scope.recieveMessages.push(message.message);
      $scope.$apply();
    };
    mobileSDK.addChannelHandler('onMessageReceived', ChannelHandler);

    // Set Axios Token.
    axios.defaults.headers.common['Api-Token'] = appToken;

    // Check if user Exsists
    axios.get(`https://api-${appId}.sendbird.com/v3/users/NewMobileUser`).then(function (response) {
    }).catch(function (error) {
      if (error.response.data.message === 'User not found.')
        // Create Mobile User.
        axios.post(`https://api-${appId}.sendbird.com/v3/users`, mobileUser);
    });

    // Connect To Server.
    mobileSDK.connect('NewMobileUser', function (user, error) {
      if (error) {
        return;
      }
      
      // Create Distinct Private Group Channel.
      var params = new mobileSDK.GroupChannelParams();
      params.isPublic = false;
      params.isDistinct = true;
      params.is_access_code_required = false;
      params.auto_accept = false;
      params.addUserIds(['NewMobileUser', 'NewFrontUser']);
      params.name = 'EMR_GROUP_CHANNEL';
      params.channelUrl = 'EMR_GROUP_CHANNEL';
      mobileSDK.GroupChannel.createChannel(params, function (groupChannel, error) {
        if (error) {
          return;
        }

        distinctGroup = groupChannel;
        groupChannel.inviteWithUserIds(['NewFrontUser'], function (response, error) {
          alert('invite')
          if (error) {
            return;
          }
        });
      });
    });
  }

  $scope.sendMessage = function () {
    distinctGroup.sendUserMessage($scope.message, function (message, error) {
      if (error) {
        return;
      }
      $scope.sentMessages.push(message.message);
      $scope.$apply();
      $scope.message = '';
    });
  }
});