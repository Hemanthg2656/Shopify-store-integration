import { jest } from "@jest/globals";

// ---------------- MOCK ----------------

const mockFindAll = jest.fn();
const mockFindById = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();


jest.unstable_mockModule(
  "../../src/repositories/user.repository.js",
  () => ({
    findAll: mockFindAll,
    findById: mockFindById,
    update: mockUpdate,
    remove: mockRemove,
  }),
);


// ------------ IMPORT AFTER MOCK ------------

const userService =
  await import("../../src/service/user.services.js");



describe("user.services", () => {


  beforeEach(() => {
    jest.clearAllMocks();
  });



  describe("getAllUsers", () => {


    it("should return all users", async () => {


      const users = [
        {
          id:1,
          name:"John"
        },
        {
          id:2,
          name:"Alex"
        }
      ];


      mockFindAll.mockResolvedValue(users);


      const result =
        await userService.getAllUsers();



      expect(mockFindAll)
        .toHaveBeenCalled();



      expect(result)
        .toEqual(users);

    });

  });



  describe("getUserById", () => {


    it("should return user by id", async () => {


      const user = {
        id:1,
        name:"John"
      };


      mockFindById.mockResolvedValue(user);



      const result =
        await userService.getUserById(1);



      expect(mockFindById)
        .toHaveBeenCalledWith(1);



      expect(result)
        .toEqual(user);

    });



  });



  describe("updateUser", () => {


    it("should update user details", async () => {


      const updates = {
        name:"Updated Name"
      };


      const updatedUser = {

        id:1,

        name:"Updated Name"

      };


      mockUpdate.mockResolvedValue(updatedUser);



      const result =
        await userService.updateUser(
          1,
          updates
        );



      expect(mockUpdate)
        .toHaveBeenCalledWith(
          1,
          updates
        );



      expect(result)
        .toEqual(updatedUser);


    });


  });



  describe("deleteUser", () => {


    it("should delete user", async () => {


      mockRemove.mockResolvedValue({
        success:true
      });



      const result =
        await userService.deleteUser(1);



      expect(mockRemove)
        .toHaveBeenCalledWith(1);



      expect(result)
        .toEqual({
          success:true
        });


    });


  });



});