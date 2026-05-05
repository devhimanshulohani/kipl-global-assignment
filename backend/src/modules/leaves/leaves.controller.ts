import { Request, Response } from 'express';
import * as leavesService from './leaves.service';

export const apply = async (req: Request, res: Response) => {
  const leave = await leavesService.apply(req.user!.id, req.body);
  res.status(201).json(leave);
};

export const listOwn = async (req: Request, res: Response) => {
  const records = await leavesService.listOwn(req.user!.id);
  res.json(records);
};

export const listPending = async (req: Request, res: Response) => {
  res.json(await leavesService.listPending(req.user!.id));
};

export const listAll = async (_req: Request, res: Response) => {
  res.json(await leavesService.listAll());
};

export const approve = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const leave = await leavesService.approve(id, req.user!, req.body.remark);
  res.json(leave);
};

export const reject = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const leave = await leavesService.reject(id, req.user!, req.body.remark);
  res.json(leave);
};

export const cancel = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await leavesService.cancel(id, req.user!.id);
  res.status(204).send();
};
