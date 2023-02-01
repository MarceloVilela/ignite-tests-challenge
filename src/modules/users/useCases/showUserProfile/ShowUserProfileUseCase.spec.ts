import { v4 as uuidv4 } from 'uuid';
import { compare } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { ShowUserProfileError } from './ShowUserProfileError';

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      usersRepositoryInMemory
    );

    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able to list profile", async () => {
    const user = {
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123pass",
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    expect(userCreated).toHaveProperty("id");
    const profile = await showUserProfileUseCase.execute(String(userCreated.id));

    expect(profile).toHaveProperty("id");

    const passMatch = compare(userCreated.password, profile.password);
    expect(passMatch).toBeTruthy();

    expect(profile.email).toEqual(user.email);
    expect(profile.name).toEqual(user.name);
  });

  it("should not be able to get profile whit non-existing user", async () => {
    expect((async () => {
      await showUserProfileUseCase.execute(uuidv4());
    })).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});