import mixpanel from 'mixpanel-browser';

let initialized = false;

export function init(token) {
  if (!token) return;
  mixpanel.init(token, { track_pageview: false, persistence: 'localStorage' });
  initialized = true;
}

export function identify(userId, properties = {}) {
  if (!initialized) return;
  mixpanel.identify(userId);
  mixpanel.people.set(properties);
}

export function track(eventName, properties = {}) {
  if (!initialized) return;
  mixpanel.track(eventName, properties);
}

export function reset() {
  if (!initialized) return;
  mixpanel.reset();
}
