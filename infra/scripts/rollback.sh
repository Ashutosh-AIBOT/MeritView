#!/usr/bin/env bash
set -euo pipefail
kubectl rollout undo deployment/backend -n production
kubectl rollout undo deployment/frontend -n production
kubectl rollout status deployment/backend -n production
kubectl rollout status deployment/frontend -n production
