FROM lscr.io/linuxserver/code-server:latest

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /config/workspace && \
    chown -R abc:abc /config/workspace

RUN node --version && npm --version 