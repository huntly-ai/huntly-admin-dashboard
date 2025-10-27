#!/bin/bash

# Script to create component folders and add memo/optimization patterns

PAGES=("projetos" "financeiro" "contratos" "leads" "clientes" "times")

for page in "${PAGES[@]}"; do
  echo "✓ Setting up $page"
  mkdir -p "app/(dashboard)/$page/components"
done

echo ""
echo "✅ Component folders created!"
echo "Now manually extracting components with optimizations..."
