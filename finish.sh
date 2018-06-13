if [ "$TRAVIS_BRANCH" = "master" ]
then
    {
    echo "call $TRAVIS_BRANCH branch"
    ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_MASTER":"$RANCHER_SECRETKEY_MASTER"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_MASTER/v2-beta/projects?name=Production" | jq '.data[].id' | tr -d '"'`
    echo $ENV_ID
    RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_MASTER";
    RANCHER_SECRETKEY="$RANCHER_SECRETKEY_MASTER";
    RANCHER_URL="$RANCHER_URL_MASTER";
    SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_MASTER";
    SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_MASTER";
  }
elif [ "$TRAVIS_BRANCH" = "develop" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_DEVELOP":"$RANCHER_SECRETKEY_DEVELOP"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_DEVELOP/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_DEVELOP";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_DEVELOP";
      RANCHER_URL="$RANCHER_URL_DEVELOP";
      SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_DEVELOP";
      SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_DEVELOP";
  }
elif [ "$TRAVIS_BRANCH" = "staging" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_STAGING":"$RANCHER_SECRETKEY_STAGING"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_STAGING/v2-beta/projects?name=Staging" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_STAGING";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_STAGING";
      RANCHER_URL="$RANCHER_URL_STAGING";
      SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_STAGING";
      SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_STAGING";
    }
else
  {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_QA":"$RANCHER_SECRETKEY_QA"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_QA/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_QA";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_QA";
      RANCHER_URL="$RANCHER_URL_QA";
      SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_QA";
      SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_QA";
  }
fi

SERVICE_ID_PROMOSTANDAED=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME_PROMOSTANDAED" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_PROMOSTANDAED

SERVICE_ID_PROMOSTANDAED_FEATHERS_SERVICE=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_PROMOSTANDAED_FEATHERS_SERVICE

echo "waiting for service to upgrade "
    while true; do

      case `curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
          -X GET \
          -H 'Accept: application/json' \
          -H 'Content-Type: application/json' \
          "$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_PROMOSTANDAED/" | jq '.state'` in
          "\"upgraded\"" )
              echo "completing service upgrade"
              curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
                -X POST \
                -H 'Accept: application/json' \
                -H 'Content-Type: application/json' \
                "$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_PROMOSTANDAED?action=finishupgrade"
              break ;;
          "\"upgrading\"" )
              echo "still upgrading"
              echo -n "."
              sleep 60
              continue ;;
          *)
              die "unexpected upgrade state" ;;
      esac
    done

    echo "waiting for service to upgrade "
        while true; do

          case `curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
              -X GET \
              -H 'Accept: application/json' \
              -H 'Content-Type: application/json' \
              "$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_PROMOSTANDAED_FEATHERS_SERVICE/" | jq '.state'` in
              "\"upgraded\"" )
                  echo "completing service upgrade"
                  curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
                    -X POST \
                    -H 'Accept: application/json' \
                    -H 'Content-Type: application/json' \
                    "$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_PROMOSTANDAED_FEATHERS_SERVICE?action=finishupgrade"
                  break ;;
              "\"upgrading\"" )
                  echo "still upgrading"
                  echo -n "."
                  sleep 60
                  continue ;;
              *)
                  die "unexpected upgrade state" ;;
          esac
        done
