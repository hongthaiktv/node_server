# node_server
Remote enviroment for developer

## Curl

`--cacert <file>` to use a custom CA cert bundle.

```
curl --cacert ca-certificates.crt https://example.com
```

Curl recognizes the environment variable named `CURL_CA_BUNDLE` if it is set, and uses the given path as a path to a CA cert bundle.

The windows version of curl will automatically look for a CA certs file named 'curl-ca-bundle.crt', either in the same directory as curl.exe, or in the Current Working Directory, or in any folder along your PATH.

`--capath <dir>` to use the specified certificate directory.

```
curl --capath /etc/ssl/certs/ https://example.com
```

Multiple paths separating with ":" (e.g. "path1:path2:path3").

Using `--capath` can allow OpenSSL more efficiently than using `--cacert` if the --cacert file contains many CA certificates.
