import type { Response } from 'express';
import type { AuthRequest } from '../types';
import { Workflow } from '../models/Workflow.model';
import { logger } from '../utils/logger';

// ─── List all workflows for the authenticated user (lightweight — no nodes/edges) ──

export async function listWorkflows(req: AuthRequest, res: Response): Promise<void> {
  try {
    const workflows = await Workflow.find({ userId: req.userId })
      .select('name nodes edges createdAt updatedAt')
      .sort({ updatedAt: -1 });

    // Return a summary list (node/edge counts, no full data) for performance
    const list = workflows.map((wf) => ({
      id: (wf._id as { toString(): string }).toString(),
      name: wf.name,
      nodeCount: (wf.nodes as unknown[]).length,
      edgeCount: (wf.edges as unknown[]).length,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
    }));

    res.status(200).json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch workflows.';
    logger.error(`[Workflow] list error: ${message}`);
    res.status(500).json({ error: message });
  }
}

// ─── Create a new workflow ────────────────────────────────────────────────────

export async function createWorkflow(req: AuthRequest, res: Response): Promise<void> {
  const { name, nodes, edges, createdAt, updatedAt } = req.body as {
    name?: string;
    nodes?: unknown[];
    edges?: unknown[];
    createdAt?: string;
    updatedAt?: string;
  };

  if (!name) {
    res.status(400).json({ error: 'Workflow name is required.' });
    return;
  }

  try {
    const now = new Date().toISOString();
    const wf = await Workflow.create({
      userId: req.userId,
      name,
      nodes: nodes ?? [],
      edges: edges ?? [],
      createdAt: createdAt ?? now,
      updatedAt: updatedAt ?? now,
    });

    logger.success(`[Workflow] created "${wf.name}" for user ${req.userId}`);
    res.status(201).json(wf.toJSON());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create workflow.';
    logger.error(`[Workflow] create error: ${message}`);
    res.status(500).json({ error: message });
  }
}

// ─── Get a single workflow by id ─────────────────────────────────────────────

export async function getWorkflow(req: AuthRequest, res: Response): Promise<void> {
  try {
    const wf = await Workflow.findOne({ _id: req.params.id, userId: req.userId });

    if (!wf) {
      res.status(404).json({ error: 'Workflow not found.' });
      return;
    }

    res.status(200).json(wf.toJSON());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch workflow.';
    logger.error(`[Workflow] get error: ${message}`);
    res.status(500).json({ error: message });
  }
}

// ─── Update a workflow ────────────────────────────────────────────────────────

export async function updateWorkflow(req: AuthRequest, res: Response): Promise<void> {
  const { name, nodes, edges } = req.body as {
    name?: string;
    nodes?: unknown[];
    edges?: unknown[];
  };

  try {
    const wf = await Workflow.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        ...(name !== undefined && { name }),
        ...(nodes !== undefined && { nodes }),
        ...(edges !== undefined && { edges }),
        updatedAt: new Date().toISOString(),
      },
      { new: true, runValidators: true }
    );

    if (!wf) {
      res.status(404).json({ error: 'Workflow not found.' });
      return;
    }

    logger.success(`[Workflow] updated "${wf.name}" for user ${req.userId}`);
    res.status(200).json(wf.toJSON());
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update workflow.';
    logger.error(`[Workflow] update error: ${message}`);
    res.status(500).json({ error: message });
  }
}

// ─── Delete a workflow ────────────────────────────────────────────────────────

export async function deleteWorkflow(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await Workflow.deleteOne({ _id: req.params.id, userId: req.userId });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Workflow not found.' });
      return;
    }

    logger.success(`[Workflow] deleted ${req.params.id} for user ${req.userId}`);
    res.status(200).json({ message: 'Workflow deleted.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete workflow.';
    logger.error(`[Workflow] delete error: ${message}`);
    res.status(500).json({ error: message });
  }
}
