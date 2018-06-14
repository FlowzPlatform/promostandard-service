if [ "$TRAVIS_BRANCH" = "master" ]
then
    {
    echo "call $TRAVIS_BRANCH branch"
    ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_MASTER":"$RANCHER_SECRETKEY_MASTER"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_MASTER/v2-beta/projects?name=Production" | jq '.data[].id' | tr -d '"'`
    echo $ENV_ID
    USERNAME="$DOCKER_USERNAME_FLOWZ";
    DOMAINKEY="$DOMAINKEY_MASTER";
    TAG="latest";
    SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_MASTER";
    SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_MASTER";
    BACKEND_HOST="$BACKEND_HOST_MASTER";
    RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_MASTER";
    RANCHER_SECRETKEY="$RANCHER_SECRETKEY_MASTER";
    RANCHER_URL="$RANCHER_URL_MASTER";
    RDB_HOST="$RDB_HOST_MASTER";
    SERVICEURL:"$SERVICEURL_MASTER";
    RDB_PORT="$RDB_PORT_MASTER";
  }
elif [ "$TRAVIS_BRANCH" = "develop" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_DEVELOP":"$RANCHER_SECRETKEY_DEVELOP"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_DEVELOP/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_DEVELOP";
      TAG="dev";
      SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_DEVELOP";
      SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_DEVELOP";
      BACKEND_HOST="$BACKEND_HOST_DEVELOP";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_DEVELOP";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_DEVELOP";
      RANCHER_URL="$RANCHER_URL_DEVELOP";
      RDB_HOST="$RDB_HOST_DEVELOP";
      SERVICEURL="$SERVICEURL_DEVELOP";
      RDB_PORT="$RDB_PORT_DEVELOP";
  }
elif [ "$TRAVIS_BRANCH" = "staging" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_STAGING":"$RANCHER_SECRETKEY_STAGING"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_STAGING/v2-beta/projects?name=Staging" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_STAGING";
      TAG="staging";
      SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_STAGING";
      SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_STAGING";
      BACKEND_HOST="$BACKEND_HOST_STAGING";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_STAGING";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_STAGING";
      RANCHER_URL="$RANCHER_URL_STAGING";
      RDB_HOST="$RDB_HOST_STAGING";
      SERVICEURL="$SERVICEURL_STAGING";
      RDB_PORT="$RDB_PORT_STAGING";
  }
else
  {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_QA":"$RANCHER_SECRETKEY_QA"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_QA/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_QA";
      TAG="qa";
      SERVICE_NAME_PROMOSTANDAED="$SERVICE_NAME_PROMOSTANDAED_QA";
      SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE="$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE_QA";
      BACKEND_HOST="$BACKEND_HOST_QA";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_QA";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_QA";
      RANCHER_URL="$RANCHER_URL_QA";
      RDB_HOST="$RDB_HOST_QA";
      SERVICEURL="$SERVICEURL_QA";
      RDB_PORT="$RDB_PORT_QA";
  }
fi

SERVICE_ID_PROMOSTANDAED=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME_PROMOSTANDAED" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_PROMOSTANDAED

SERVICE_ID_PROMOSTANDAED_FEATHERS_SERVICE=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME_PROMOSTANDAED_FEATHERS_SERVICE" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID_PROMOSTANDAED_FEATHERS_SERVICE

curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
       "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/promostandard:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "'"$BACKEND_HOST"'"},"ports": ["8000:8000/tcp"],"environment": {"serviceUrl": "'"$SERVICEURL"'","domainKey": "'"$DOMAINKEY"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 8000,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_PROMOSTANDAED?action=upgrade


curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
       "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/promostandard_feathers_service:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "'"$BACKEND_HOST"'"},"ports": ["3080:3080/tcp"],"environment": {"RDB_HOST": "'"$RDB_HOST"'","RDB_PORT": "'"$RDB_PORT"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3080,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID_PROMOSTANDAED_FEATHERS_SERVICE?action=upgrade
