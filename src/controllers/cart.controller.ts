import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";
import { Member } from "@prisma/client";

export class CartController {
    private cartService = new CartService();

    addToCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const data = await this.cartService.addToCart(user.id, req.body);
            res.status(201).json({ message: "장바구니에 담겼습니다.", data });
        } catch (error) {
            next(error);
        }
    };

    getCartList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const data = await this.cartService.getCartItems(user.id);
            res.status(200).json({ message: "조회 성공", data });
        } catch (error) {
            next(error);
        }
    };

    updateQuantity = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const { id } = req.params;
            const { quantity } = req.body;
            const data = await this.cartService.updateQuantity(Number(id), user.id, quantity);
            res.status(200).json({ message: "수량이 변경되었습니다.", data });
        } catch (error) {
            next(error);
        }
    };

    deleteItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as Member;
            const { id } = req.params;
            await this.cartService.removeItem(Number(id), user.id);
            res.status(200).json({ message: "삭제되었습니다." });
        } catch (error) {
            next(error);
        }
    };
}
