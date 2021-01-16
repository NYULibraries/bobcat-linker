FROM hashicorp/terraform:light

ENV BACKEND_CONFIG="dev-backend.dev"

COPY . .

ENTRYPOINT [ "terraform" ]

CMD [ "plan", "-backend-config=${BACKEND_CONFIG}" ]