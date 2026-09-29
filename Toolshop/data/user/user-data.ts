import { faker } from '@faker-js/faker';
import { RegisterUserRequest } from '../../apis/users/users-api';

export function generateUser(): RegisterUserRequest {
  const firstName = faker.person.firstName().replace(/[^A-Za-z]/g, '');
  const lastName = faker.person.lastName().replace(/[^A-Za-z]/g, '');
  const uniqueSuffix = `${Date.now()}${faker.string.alphanumeric(6)}`;

  return {
    first_name: firstName,
    last_name: lastName,
    dob: faker.date
      .birthdate({ mode: 'age', min: 20, max: 60 })
      .toISOString()
      .split('T')[0],
    phone: faker.string.numeric(10),
    email: `qa.${uniqueSuffix}@example.com`.toLowerCase(),
    password: `Qa#${faker.string.alphanumeric(10)}9x!`,
    address: {
      street: faker.location.street(),
      house_number: faker.string.numeric(2),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'EG',
      postal_code: faker.string.numeric(5),
    },
  };
}

export default {
  invalidCredentials: {
    email: 'not.registered@example.com',
    password: 'Wrong#Pass123',
  },
  invalidLoginMessage: 'Invalid email or password',
};
