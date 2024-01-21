export const agentClient = (proxy) => {
    if (!proxy) return;
    const proxyConfig = proxy.split('://')[0].toLowerCase();
    let proxyType, host, port, username, password, agent, agentType;
    if (proxyConfig.length > 1) {
        proxyType = proxyConfig[0];
        [host, port, username, password] = proxyConfig[1].split(':')
    } else {
        [host, port, username, password] = proxyConfig[0].split(':')
    }
    switch (proxyType?.toLowerCase()) {
      case 'socks5':
        agent = new SocksProxyAgent(
          username
            ? `socks://${username}:${password}@${host}:${port}`
            : `socks://${host}:${port}`,
        );
        agentType = 'httpsAgent';
        break;
      case 'http':
        agent = new HttpProxyAgent(
          username
            ? `http://${username}:${password}@${host}:${port}`
            : `http://${host}:${port}`,
        );
        agentType = 'httpAgent';
        break;
      case 'https':
        agent = new HttpsProxyAgent(
          username
            ? `http://${username}:${password}@${host}:${port}`
            : `http://${host}:${port}`,
        );
        agentType = 'httpsAgent';
        break;

      default:
        break;
    }

    return { agent, agentType };
}