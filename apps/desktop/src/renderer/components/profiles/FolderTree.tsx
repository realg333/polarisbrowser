import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {

  FolderPlus,

  Folder as FolderIcon,

  Inbox,

  ChevronRight,

  ChevronDown,

  Pencil,

  Trash2,

  FolderInput,

} from 'lucide-react';

import type { Folder } from '@polaris/shared';

import { FOLDER_COLORS } from '@polaris/shared';

import { cn } from '@/lib/utils';

import { useAppStore } from '@/stores/app-store';

import { TooltipButton } from '@/components/shared/TooltipButton';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { FormDialog } from '@/components/shared/FormDialog';

import { toast } from 'sonner';



interface FolderNode extends Folder {

  children: FolderNode[];

}



function buildFolderTree(folders: Folder[]): FolderNode[] {

  const map = new Map<string, FolderNode>();

  const roots: FolderNode[] = [];



  for (const folder of folders) {

    map.set(folder.id, { ...folder, children: [] });

  }



  for (const folder of folders) {

    const node = map.get(folder.id)!;

    if (folder.parentId && map.has(folder.parentId)) {

      map.get(folder.parentId)!.children.push(node);

    } else {

      roots.push(node);

    }

  }



  return roots;

}



export function FolderTree(): React.ReactElement {

  const selectedFolderId = useAppStore((s) => s.selectedFolderId);

  const setSelectedFolderId = useAppStore((s) => s.setSelectedFolderId);

  const queryClient = useQueryClient();



  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [dialog, setDialog] = useState<

    | { mode: 'create'; parentId?: string | null }

    | { mode: 'edit'; folder: Folder }

    | null

  >(null);

  const [formName, setFormName] = useState('');

  const [formColor, setFormColor] = useState(FOLDER_COLORS[0]);



  const { data: folders = [] } = useQuery({

    queryKey: ['folders'],

    queryFn: () => window.polaris.folders.list(),

  });



  const createMutation = useMutation({

    mutationFn: (input: { name: string; parentId?: string | null; color?: string }) =>

      window.polaris.folders.create(input),

    onSuccess: (result) => {

      if (result.error) {

        toast.error(result.error);

        return;

      }

      toast.success('Pasta criada');

      queryClient.invalidateQueries({ queryKey: ['folders'] });

      setDialog(null);

    },

  });



  const updateMutation = useMutation({

    mutationFn: ({ id, input }: { id: string; input: { name?: string; color?: string } }) =>

      window.polaris.folders.update(id, input),

    onSuccess: () => {

      toast.success('Pasta atualizada');

      queryClient.invalidateQueries({ queryKey: ['folders'] });

      setDialog(null);

    },

  });



  const deleteMutation = useMutation({

    mutationFn: (id: string) => window.polaris.folders.delete(id),

    onSuccess: () => {

      toast.success('Pasta excluída');

      queryClient.invalidateQueries({ queryKey: ['folders'] });

      queryClient.invalidateQueries({ queryKey: ['profiles'] });

      if (selectedFolderId !== 'all' && selectedFolderId !== 'none') {

        setSelectedFolderId('all');

      }

    },

  });



  const totalProfiles = folders.reduce((acc, f) => acc + (f.profileCount ?? 0), 0);

  const tree = buildFolderTree(folders);



  const openCreate = (parentId?: string | null): void => {

    setFormName('');

    setFormColor(FOLDER_COLORS[folders.length % FOLDER_COLORS.length]);

    setDialog({ mode: 'create', parentId });

  };



  const openEdit = (folder: Folder): void => {

    setFormName(folder.name);

    setFormColor(folder.color);

    setDialog({ mode: 'edit', folder });

  };



  const toggleExpand = (id: string): void => {

    setExpanded((prev) => {

      const next = new Set(prev);

      if (next.has(id)) next.delete(id);

      else next.add(id);

      return next;

    });

  };



  const handleSubmit = (): void => {

    const name = formName.trim();

    if (!name) return;



    if (dialog?.mode === 'create') {

      createMutation.mutate({ name, parentId: dialog.parentId, color: formColor });

    } else if (dialog?.mode === 'edit') {

      updateMutation.mutate({ id: dialog.folder.id, input: { name, color: formColor } });

    }

  };



  const handleDelete = (folder: Folder): void => {

    if (!confirm(`Excluir pasta "${folder.name}"? Os perfis serão movidos para "Sem pasta".`)) return;

    deleteMutation.mutate(folder.id);

  };



  return (

    <div className="space-y-1">

      <div className="flex items-center justify-between px-2 py-1">

        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pastas</span>

        <TooltipButton

          tooltip="Criar nova pasta para organizar perfis"

          size="icon"

          variant="ghost"

          className="h-7 w-7"

          onClick={() => openCreate(null)}

        >

          <FolderPlus className="h-3.5 w-3.5" />

        </TooltipButton>

      </div>



      <FolderItem

        label="Todos"

        count={totalProfiles}

        icon={Inbox}

        active={selectedFolderId === 'all'}

        onClick={() => setSelectedFolderId('all')}

        tooltip="Exibir todos os perfis"

      />

      <FolderItem

        label="Sem pasta"

        icon={FolderIcon}

        active={selectedFolderId === 'none'}

        onClick={() => setSelectedFolderId('none')}

        tooltip="Perfis não atribuídos a nenhuma pasta"

      />



      {tree.map((node) => (

        <FolderTreeNode

          key={node.id}

          node={node}

          depth={0}

          expanded={expanded}

          selectedFolderId={selectedFolderId}

          onToggleExpand={toggleExpand}

          onSelect={setSelectedFolderId}

          onEdit={openEdit}

          onDelete={handleDelete}

          onCreateChild={openCreate}

        />

      ))}



      <FormDialog

        open={dialog !== null}

        title={dialog?.mode === 'edit' ? 'Editar pasta' : 'Nova pasta'}

        description={

          dialog?.mode === 'create' && dialog.parentId

            ? 'Subpasta será criada dentro da pasta selecionada.'

            : undefined

        }

        onClose={() => setDialog(null)}

        onSubmit={handleSubmit}

        submitLabel={dialog?.mode === 'edit' ? 'Salvar' : 'Criar'}

        submitDisabled={!formName.trim()}

        isPending={createMutation.isPending || updateMutation.isPending}

      >

        <div>

          <label className="text-sm font-medium">Nome</label>

          <Input

            className="mt-1"

            value={formName}

            onChange={(e) => setFormName(e.target.value)}

            placeholder="Ex: Clientes"

            autoFocus

          />

        </div>

        <div>

          <label className="text-sm font-medium">Cor</label>

          <div className="mt-2 flex flex-wrap gap-2">

            {FOLDER_COLORS.map((color) => (

              <button

                key={color}

                type="button"

                onClick={() => setFormColor(color)}

                className={cn(

                  'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',

                  formColor === color ? 'border-foreground scale-110' : 'border-transparent',

                )}

                style={{ backgroundColor: color }}

                title={color}

              />

            ))}

          </div>

        </div>

      </FormDialog>

    </div>

  );

}



function FolderTreeNode({

  node,

  depth,

  expanded,

  selectedFolderId,

  onToggleExpand,

  onSelect,

  onEdit,

  onDelete,

  onCreateChild,

}: {

  node: FolderNode;

  depth: number;

  expanded: Set<string>;

  selectedFolderId: string | null | 'all' | 'none';

  onToggleExpand: (id: string) => void;

  onSelect: (id: string) => void;

  onEdit: (folder: Folder) => void;

  onDelete: (folder: Folder) => void;

  onCreateChild: (parentId: string) => void;

}): React.ReactElement {

  const hasChildren = node.children.length > 0;

  const isExpanded = expanded.has(node.id);



  return (

    <div>

      <div

        className="group flex items-center"

        style={{ paddingLeft: depth * 12 }}

      >

        <button

          type="button"

          className="flex h-8 w-5 shrink-0 items-center justify-center text-muted-foreground"

          onClick={() => hasChildren && onToggleExpand(node.id)}

          aria-label={isExpanded ? 'Recolher' : 'Expandir'}

        >

          {hasChildren ? (

            isExpanded ? (

              <ChevronDown className="h-3.5 w-3.5" />

            ) : (

              <ChevronRight className="h-3.5 w-3.5" />

            )

          ) : (

            <span className="w-3.5" />

          )}

        </button>



        <FolderItem

          label={node.name}

          count={node.profileCount}

          color={node.color}

          active={selectedFolderId === node.id}

          onClick={() => onSelect(node.id)}

          tooltip={`Filtrar perfis da pasta ${node.name}`}

          className="flex-1"

        />



        <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">

          <TooltipButton

            tooltip="Criar subpasta"

            size="icon"

            variant="ghost"

            className="h-6 w-6"

            onClick={() => onCreateChild(node.id)}

          >

            <FolderInput className="h-3 w-3" />

          </TooltipButton>

          <TooltipButton

            tooltip="Renomear pasta"

            size="icon"

            variant="ghost"

            className="h-6 w-6"

            onClick={() => onEdit(node)}

          >

            <Pencil className="h-3 w-3" />

          </TooltipButton>

          <TooltipButton

            tooltip="Excluir pasta"

            size="icon"

            variant="ghost"

            className="h-6 w-6"

            onClick={() => onDelete(node)}

          >

            <Trash2 className="h-3 w-3 text-destructive" />

          </TooltipButton>

        </div>

      </div>



      {hasChildren && isExpanded &&

        node.children.map((child) => (

          <FolderTreeNode

            key={child.id}

            node={child}

            depth={depth + 1}

            expanded={expanded}

            selectedFolderId={selectedFolderId}

            onToggleExpand={onToggleExpand}

            onSelect={onSelect}

            onEdit={onEdit}

            onDelete={onDelete}

            onCreateChild={onCreateChild}

          />

        ))}

    </div>

  );

}



function FolderItem({

  label,

  count,

  icon: Icon,

  color,

  active,

  onClick,

  tooltip,

  className,

}: {

  label: string;

  count?: number;

  icon?: React.ComponentType<{ className?: string }>;

  color?: string;

  active: boolean;

  onClick: () => void;

  tooltip: string;

  className?: string;

}): React.ReactElement {

  return (

    <TooltipButton

      tooltip={tooltip}

      variant="ghost"

      className={cn(

        'h-8 w-full justify-start gap-2 px-2 text-sm font-normal',

        active && 'bg-sidebar-accent text-sidebar-foreground font-medium',

        className,

      )}

      onClick={onClick}

    >

      {color ? (

        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />

      ) : Icon ? (

        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

      ) : null}

      <span className="truncate flex-1 text-left">{label}</span>

      {count !== undefined && (

        <span className="text-xs text-muted-foreground">{count}</span>

      )}

    </TooltipButton>

  );

}



export function FolderChips({ folders }: { folders: Folder[] }): React.ReactElement {

  const selectedFolderId = useAppStore((s) => s.selectedFolderId);

  const setSelectedFolderId = useAppStore((s) => s.setSelectedFolderId);



  if (selectedFolderId === 'all') return <></>;



  const activeFolder =

    selectedFolderId === 'none'

      ? { id: 'none', name: 'Sem pasta' }

      : folders.find((f) => f.id === selectedFolderId);



  if (!activeFolder) return <></>;



  return (

    <div className="flex flex-wrap items-center gap-2">

      <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">

        {activeFolder.name}

      </span>

      <Button

        variant="ghost"

        size="sm"

        className="h-6 text-xs"

        onClick={() => setSelectedFolderId('all')}

      >

        Limpar filtro

      </Button>

    </div>

  );

}

