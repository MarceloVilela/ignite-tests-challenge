import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(
      usersRepositoryInMemory
    );

    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able to authenticate with correct email/password", async () => {
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

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });
  
  it("should not be able to authenticate non existing user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'nonexists@email.com',
        password: '123pass'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with wrong email/password", async () => {
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

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: userCreated.email,
        password: 'wrong-pass'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});