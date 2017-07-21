//bind all function
Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach(name => {
  let value = this[name];
  if (typeof value === "function") {
    this[name] = value.bind(this);
  }
});
