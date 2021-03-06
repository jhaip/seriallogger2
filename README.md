# seriallogger2

### Local Development

The backend Flask app runs using Docker.  Install Docker on your computer and then run:

```
docker-compose up
```

### Create DB
First create the database in a python REPL.  This creates a SQLite database called log.db with the proper tables.
```
from server import init_db
init_db()
```

### Compile with Webpack
```
npx webpack -d --watch
```

### Record data in serial monitor
```
particle serial monitor | tee >(python logger.py)
```

### View and annotate
Visit `localhost:5000` and see signals, click on them, and add annotations.

### pfgp "particle flash & git push"
```
pfgp PHOTON-IDENTIFIED FIRMWARE-FILE-OR-FOLDER
```

example usage:
```
pfgp turkey_laser ir_recording
```

### Deployment

Set up DigitalOcean droplet with Docker and local config to connect to it.
```
docker-machine create --driver digitalocean --digitalocean-access-token INSERTOKENHERE seriallogger2
```

After the droplet is set up with Docker, run docker compose to build and set up the code.  Read on for a note about switching between docker targets
```
docker-compose -f remote.yml up --build
docker-compose -f remote.yml up -d
```

##### Switching Docker targets between remote and local

Docker Machine targets a Docker Engine so any docker related commands are run against that target.  For deployments the target should be the `seriallogger2` DigitalOcean droplet.  For local development the target should be your local virtual machine like VirtualBox OR unset if you are using the latest Docker for Mac.

```
docker-machine env seriallogger2
eval $(docker-machine env seriallogger2)
```

```
docker-machine env --unset
eval $(docker-machine env --unset
```

##### Saving database backups from remote

First, target the remote docker in docker-machine.  Then copy the database:

```
docker-machine scp seriallogger2:/var/lib/docker/volumes/seriallogger2_mydatabase/_data/log.db ./backup.db
```

You can use the remote-log.db as a replacement for the local `db/log.db`.

##### Database migration

First, exec into the docker container.
For remote migrations, make sure to target the remote with docker-machine.

```
docker exec -it CONTAINER_ID bash
```

Run the migration with python

```
python
>>> from db_utils import init_db
>>> init_db()
```

---
### Legacy:
```
particle serial monitor | tee log-`date +%Y-%m-%d--%H-%M-%S`.txt
```
