FROM quay.io/nyulibraries/web-lambdas-terraform:v0.15.0-0

COPY docker-entrypoint.sh .
RUN chmod a+x ./docker-entrypoint.sh

ENTRYPOINT [ "./docker-entrypoint.sh" ]

CMD ["terraform", "plan"]