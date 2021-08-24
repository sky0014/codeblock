/**
 * 遍历对象，绑定全部函数
 * @param {*} target 要绑定到的目标
 * @param {*} proto 要执行绑定的对象，省略则以target为目标
 * @returns {void}
 */
export function bindAll(target) {
  const that = target;
  const bindFunctions = {};
  while (target && target !== Object.prototype) {
    // eslint-disable-next-line
    Object.getOwnPropertyNames(target).forEach(name => {
      const config = Object.getOwnPropertyDescriptor(target, name);
      if (config) {
        if (config.get || config.set) {
          return;
        }

        if (name !== "constructor" && typeof that[name] === "function") {
          // 去重存储函数名
          bindFunctions[name] = true;
        }
      }
    });
    target = Object.getPrototypeOf(target);
  }
  Object.keys(bindFunctions).forEach(name => {
    that[name] = that[name].bind(that);
  });
}


class A {
  constructor() {
    //bind A and B and etc...
    bindAll(this);    
  }
}

class B extends A {
  constructor() {
    super();
  }
}
