Zero time deplyment.


docker exec -it nginx-proxy cat /etc/nginx/conf.d/default.conf

Add a section to template which will create servers by alias var
something like this, but without creating upstreams

{{ range $host, $containers := groupByMulti $ "Env.ALIASES" "," }}
