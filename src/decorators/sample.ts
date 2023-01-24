export function SplitDecorator(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  descriptor.value = function (...args: any[]) {
    try {
      const s = args[0];

      const split = s.split('').reverse().join('');

      return split;
    } catch (error) {
      throw error;
    }
  };
}

export function login(username: string, password: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    descriptor.value = function (...args: any[]) {
      const val = args[0];
      try {
        return val + username + password;
      } catch (error) {
        throw error;
      }
    };
  };
}

class Split {
  @SplitDecorator
  splitterFn(s: string) {
    return s;
  }
}

class Auth {
  @login('joe', '12345')
  user(random: string) {
    return random;
  }
}

const spl = new Split();

const auth = new Auth();

console.log(auth.user('random'));

console.log(spl.splitterFn('joe'));
