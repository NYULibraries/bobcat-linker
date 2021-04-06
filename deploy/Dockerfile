FROM quay.io/nyulibraries/web-lambdas-terraform:master

COPY . . 

ENTRYPOINT [ "./docker-entrypoint.sh" ]

CMD ["terraform", "plan"]