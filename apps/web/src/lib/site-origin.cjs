const canonicalOrigin = "https://gamabudget.com";
const defaultDevelopmentOrigin = "http://localhost:3000";

function isLoopbackHost(candidate) {
  return /^(localhost|127(?:\.\d{1,3}){3}|\[?::1\]?)(?::\d+)?(?:\/|$)/iu.test(candidate);
}

function parseConfiguredSiteOrigin(rawOrigin) {
  const candidate = rawOrigin?.trim();
  if (!candidate) {
    return undefined;
  }

  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//iu.test(candidate);
  const isLoopback = isLoopbackHost(candidate);

  if (!isLoopback && /^[a-z][a-z\d+\-.]*:/iu.test(candidate) && !hasProtocol) {
    return undefined;
  }

  const withProtocol = hasProtocol ? candidate : `${isLoopback ? "http" : "https"}://${candidate}`;

  try {
    const url = new URL(withProtocol);
    if (!/^https?:$/iu.test(url.protocol) || !url.hostname) {
      throw new TypeError("Site origin must use http or https.");
    }

    return url.origin;
  } catch {
    return undefined;
  }
}

function normalizeSiteOrigin(rawOrigin) {
  return parseConfiguredSiteOrigin(rawOrigin) ?? canonicalOrigin;
}

function resolveDeploymentOrigin(rawOrigin, environment) {
  const configuredOrigin = parseConfiguredSiteOrigin(rawOrigin);
  if (configuredOrigin) {
    return configuredOrigin;
  }

  return environment === "production" ? canonicalOrigin : defaultDevelopmentOrigin;
}

function isCanonicalProductionOrigin(rawOrigin) {
  return parseConfiguredSiteOrigin(rawOrigin) === canonicalOrigin;
}

module.exports = {
  canonicalOrigin,
  defaultDevelopmentOrigin,
  parseConfiguredSiteOrigin,
  normalizeSiteOrigin,
  resolveDeploymentOrigin,
  isCanonicalProductionOrigin
};
