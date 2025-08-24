# docker build -t suggest_calendar . -f docker/Dockerfile --progress=plain --no-cache
docker run -p 3000:3000 suggest_calendar
