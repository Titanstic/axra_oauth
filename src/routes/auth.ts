import { Router } from "express";
import * as AuthController from "../controllers/auth";
import { validateAuthenticationCode, validateReuestBodyCreate, validateReuestBodySignin } from "../middlewares/auth";

const router = Router();

// routes
//  => auth?client_id=Axra123
router.get("/", AuthController.signinView);

// =>auth/signin 
router.post("/signin", validateReuestBodySignin, AuthController.signin);

// =>auth/token
router.get("/token", validateAuthenticationCode, AuthController.generateToken);

// => auth/signup
router.post("/signup", validateReuestBodyCreate, AuthController.signup);


export default router;