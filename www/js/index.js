var googleapi = {
    authorize: function(options) {
        var deferred = $.Deferred();

        //Build the OAuth consent page URL
        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
            client_id: options.client_id,
            redirect_uri: options.redirect_uri,
            response_type: 'code',
            scope: options.scope
        });

        //Open the OAuth consent page in the InAppBrowser
        var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

        //The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
        //which sets the authorization code in the browser's title. However, we can't
        //access the title of the InAppBrowser.
        //
        //Instead, we pass a bogus redirect_uri of "http://localhost", which means the
        //authorization code will get set in the url. We can access the url in the
        //loadstart and loadstop events. So if we bind the loadstart event, we can
        //find the authorization code and close the InAppBrowser after the user
        //has granted us access to their data.
        $(authWindow).on('loadstart', function(e) {
            var url = e.originalEvent.url;
            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);

            if (code || error) {
                //Always close the browser when match is found
                authWindow.close();
            }

            if (code) {
                //Exchange the authorization code for an access token
                $.post('https://accounts.google.com/o/oauth2/token', {
                    code: code[1],
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    redirect_uri: options.redirect_uri,
                    grant_type: 'authorization_code'
                }).done(function(data) {
                    deferred.resolve(data);
                }).fail(function(response) {
                    deferred.reject(response.responseJSON);
                });
            } else if (error) {
                //The user denied access to the app
                deferred.reject({
                    error: error[1]
                });
            }
        });

        return deferred.promise();
    }
};

$(document).on('deviceready', function() {

    //onclick function to trigger login
    $("#login").click(function(){
        googleapi.authorize({
            client_id: '1024734048238-p2t15mb0h7qgtlcl7adv10k7pgkfj1fb.apps.googleusercontent.com',
            client_secret: '17IwYXzpnumzo8uiZEs_S5Bp',
            redirect_uri: 'http://localhost',
            scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
        }).done(function(data) {
            alert("just login data")
            //var t = JSON.stringify(data);
            //alert(t);
            $("#loginStatus").html('Access Token: ' + data.access_token);
            var access_token = data.access_token;
            alert(access_token);
            var url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + access_token;
            alert(url);
            //get user details from acess token
            $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                error: function(jqXHR, text_status, strError) {},
                success: function(data) {
                    var item;
                    var x = JSON.stringify(data);
                    alert(x);
                    //alert(x.email);
                    console.log(JSON.stringify(data));
                    // Save the userprofile data in your localStorage.
                    localStorage.gmailLogin = "true";
                    localStorage.gmailID = data.id;
                    localStorage.gmailEmail = data.email;
                    localStorage.gmailFirstName = data.given_name;
                    localStorage.gmailLastName = data.family_name;
                    localStorage.gmailProfilePicture = data.picture;
                    localStorage.gmailGender = data.gender;
                }
            });
        }).fail(function(data) {
            $("#loginStatus").html(data.error);
        });
    });
    $("#getValues").click(function(){

        var id1 = window.localStorage.getItem('gmailID');
        var id2 = window.localStorage.getItem('gmailEmail');
        var id3 = window.localStorage.getItem('gmailFirstName');
        var id4 = window.localStorage.getItem('gmailLastName');
        var id5 = window.localStorage.getItem('gmailProfilePicture');
        var id6 = window.localStorage.getItem('gmailGender');

        var display = '<h4 class="header">List of user details</h4>'
                      +'<p>'+id1+'</p>'
                      +'<p>'+id2+'</p>'
                      +'<p>'+id3+'</p>'
                      +'<p>'+id4+'</p>'
                      +'<p>'+id5+'</p>'
                      +'<p>'+id6+'</p>';
        $('#header_content').append(display);
    });

});