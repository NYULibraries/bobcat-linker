FROM quay.io/nyulibraries/web-lambdas-terraform:master

COPY docker-entrypoint.sh .
RUN chmod a+x ./docker-entrypoint.sh

ENTRYPOINT [ "./docker-entrypoint.sh" ]

CMD ["terraform", "plan"]