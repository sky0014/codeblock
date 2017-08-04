/**
 * 遍历对象，绑定全部函数
 * @param {*} target 要绑定到的目标
 * @param {*} proto 要执行绑定的对象，省略则以target为目标
 */
function bindAll(target, proto) {
  if (proto === undefined) {
    proto = Object.getPrototypeOf(target);
  }
  Object.getOwnPropertyNames(proto).forEach(name => {
    let value = target[name];
    if (typeof value === "function") {
      target[name] = value.bind(target);
    }
  });
}

class A {
  constructor() {
    //bind A
    bindAll(this, A.prototype);
    //bind B or other sub class
    bindAll(this);
  }
}

class B extends A {
  constructor() {
    super();
  }
}
