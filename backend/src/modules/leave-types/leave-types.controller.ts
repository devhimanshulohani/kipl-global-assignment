import { Request, Response } from 'express';
import * as leaveTypesService from './leave-types.service';

export const list = async (_req: Request, res: Response) => {
  const types = await leaveTypesService.list();
  res.json(types);
};

export const create = async (req: Request, res: Response) => {
  const lt = await leaveTypesService.create(req.body);
  res.status(201).json(lt);
};

export const update = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const lt = await leaveTypesService.update(id, req.body);
  res.json(lt);
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await leaveTypesService.remove(id);
  res.status(204).send();
};
