"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
const s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: (_a = process.env.ACCESS_KEY_ID) !== null && _a !== void 0 ? _a : '',
        secretAccessKey: (_b = process.env.ACCESS_SECRET) !== null && _b !== void 0 ? _b : '',
    },
    region: 'us-east-1',
});
router.get('/presignedUrl', middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
        Bucket: 'decentralized-tasks',
        Key: `tasks/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ['content-length-range', 0, 5 * 1024 * 1024], // 5 MB max
        ],
        Expires: 3600,
    });
    res.json({
        preSignedUrl: url,
        fields,
    });
}));
// signin with wallet
// signing a message
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Todo: add sign verification logic here
    // const { message, address, signature } = req.body
    const existingUser = yield prismaClient.user.findUnique({
        where: { address: req.body.address },
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({ userId: existingUser.id }, config_1.JWT_SECRET);
        res.json({ token });
    }
    else {
        const newUser = yield prismaClient.user.create({
            data: { address: req.body.address },
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, config_1.JWT_SECRET);
        res.json({ token });
    }
}));
exports.default = router;
