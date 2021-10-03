const forwardHaptic = (node, haptic) => {
  const e = new Event('haptic', { composed: true });
  e.detail = { haptic };
  node.dispatchEvent(e);
};

export default (node, hass, config, actionConfig, entityId) => {
  let e;
  // eslint-disable-next-line default-case
  switch (actionConfig.action) {
    case 'more-info': {
      e = new Event('hass-more-info', { composed: true });
      e.detail = {
        entityId: actionConfig.entity || entityId,
      };
      node.dispatchEvent(e);
      break;
    }
    case 'navigate': {
      if (!actionConfig.navigation_path) return;
      window.history.pushState(null, '', actionConfig.navigation_path);
      e = new Event('location-changed', { composed: true });
      e.detail = { replace: false };
      window.dispatchEvent(e);
      break;
    }
    case 'call-service': {
      if (!actionConfig.service) return;
      const [domain, service] = actionConfig.service.split('.', 2);
      const serviceData = { ...actionConfig.service_data };
      hass.callService(domain, service, serviceData);
      break;
    }
    case 'url': {
      if (!actionConfig.url) return;
      if (actionConfig.new_tab) {
        window.open(actionConfig.url, '_blank');
      } else {
        window.location.href = actionConfig.url;
      }
      break;
    }
    case 'fire-dom-event': {
      e = new Event('ll-custom', { composed: true, bubbles: true });
      e.detail = actionConfig;
      node.dispatchEvent(e);
      break;
    }
  }

  if (actionConfig.haptic) forwardHaptic(node, actionConfig.haptic);
};
