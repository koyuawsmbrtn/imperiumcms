if [[ $REBUILD = "true" ]]
then
  npm run build
fi

if [[ $BROWSER = "true" ]]
then
  xdg-open http://localhost:8080 &
fi

if [[ $REDIS = "true" ]]
then
  redis-server &
fi

python3 main.py
