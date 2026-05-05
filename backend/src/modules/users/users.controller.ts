import { Request, Response } from 'express';
import * as usersService from './users.service';

export const list = async (req: Request, res: Response) => {
  res.json(await usersService.list(req.user!.id));
};

export const create = async (req: Request, res: Response) => {
  const user = await usersService.create(req.body);
  res.status(201).json(user);
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = await usersService.update(id, req.body);
  res.json(user);
};
