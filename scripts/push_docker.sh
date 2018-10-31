#!/bin/sh -e

: "${IMAGES_DOMAIN?Must specify IMAGES_DOMAIN}"

docker tag bobcat-linker $IMAGES_DOMAIN/bobcat-linker:latest
docker push $IMAGES_DOMAIN/bobcat-linker:latest
