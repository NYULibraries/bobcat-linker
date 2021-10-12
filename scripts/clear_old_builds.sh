exclude_args=""
get_latest_versions() {
  # Recursively list all lambda functions in bucket, sort by date, pull the latest N files, and extract just the filename into a temp file to maintain newline spacing
  aws s3 ls s3://"${S3_BUCKET}"/"${LAMBDA_FN}"/ --recursive | sort | tail -n "${KEEP_BUILDS_NUM}" | awk '{print $4}' > exclude.txt
}
generate_exclude_args() {
  exclude_files="$(cat exclude.txt)"
  # Loop through files we want to keep and format as --exclude <filename> parameters for the AWS-CLI
  for line in $exclude_files; do exclude_args="$exclude_args--exclude $(echo "$line" | awk -F'/' '{printf("%s/%s"), $2, $3}') "; done
}
delete_s3_objects() {
  # Recursively remove all lambda functions of given name, in given bucket except the ones we explicitly exclude
  # shellcheck disable=SC2086
  aws s3 rm s3://"${S3_BUCKET}"/"${LAMBDA_FN}"/ --recursive $exclude_args
}
get_latest_versions
generate_exclude_args
delete_s3_objects