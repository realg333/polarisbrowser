import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Plus, X, Trash2 } from 'lucide-react';

import { TAG_COLORS } from '@polaris/shared';

import { cn } from '@/lib/utils';

import { useAppStore } from '@/stores/app-store';

import { TooltipButton } from '@/components/shared/TooltipButton';

import { Input } from '@/components/ui/input';

import { FormDialog } from '@/components/shared/FormDialog';

import { toast } from 'sonner';



export function TagFilterBar(): React.ReactElement {

  const selectedTagId = useAppStore((s) => s.selectedTagId);

  const setSelectedTagId = useAppStore((s) => s.setSelectedTagId);

  const queryClient = useQueryClient();



  const [showCreate, setShowCreate] = useState(false);

  const [formName, setFormName] = useState('');

  const [formColor, setFormColor] = useState(TAG_COLORS[0]);



  const { data: tags = [] } = useQuery({

    queryKey: ['tags'],

    queryFn: () => window.polaris.tags.list(),

  });



  const createMutation = useMutation({

    mutationFn: (input: { name: string; color: string }) => window.polaris.tags.create(input),

    onSuccess: (result) => {

      if (result.error) {

        toast.error(result.error);

        return;

      }

      toast.success('Tag criada');

      queryClient.invalidateQueries({ queryKey: ['tags'] });

      setShowCreate(false);

      setFormName('');

    },

  });



  const deleteMutation = useMutation({

    mutationFn: (id: string) => window.polaris.tags.delete(id),

    onSuccess: () => {

      toast.success('Tag excluída');

      queryClient.invalidateQueries({ queryKey: ['tags'] });

      queryClient.invalidateQueries({ queryKey: ['profiles'] });

      setSelectedTagId(null);

    },

  });



  const openCreate = (): void => {

    setFormName('');

    setFormColor(TAG_COLORS[tags.length % TAG_COLORS.length]);

    setShowCreate(true);

  };



  const handleDelete = (id: string, name: string): void => {

    if (!confirm(`Excluir tag "${name}"? Será removida de todos os perfis.`)) return;

    deleteMutation.mutate(id);

  };



  return (

    <div className="flex flex-wrap items-center gap-2">

      <span className="text-xs text-muted-foreground">Tags:</span>

      {tags.map((tag) => (

        <div key={tag.id} className="group relative">

          <button

            type="button"

            onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}

            className={cn(

              'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',

              selectedTagId === tag.id

                ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'

                : 'opacity-80 hover:opacity-100',

            )}

            style={{

              backgroundColor: `${tag.color}22`,

              color: tag.color,

              border: `1px solid ${tag.color}44`,

            }}

            title={`Filtrar por tag ${tag.name}`}

          >

            {tag.name}

          </button>

          <button

            type="button"

            onClick={() => handleDelete(tag.id, tag.name)}

            className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex"

            title={`Excluir tag ${tag.name}`}

          >

            <Trash2 className="h-2.5 w-2.5" />

          </button>

        </div>

      ))}

      <TooltipButton

        tooltip="Criar nova tag para categorizar perfis"

        size="sm"

        variant="outline"

        className="h-6 gap-1 px-2 text-xs"

        onClick={openCreate}

      >

        <Plus className="h-3 w-3" />

        Tag

      </TooltipButton>

      {selectedTagId && (

        <TooltipButton

          tooltip="Remover filtro de tag"

          size="sm"

          variant="ghost"

          className="h-6 px-2 text-xs"

          onClick={() => setSelectedTagId(null)}

        >

          <X className="h-3 w-3" />

        </TooltipButton>

      )}



      <FormDialog

        open={showCreate}

        title="Nova tag"

        onClose={() => setShowCreate(false)}

        onSubmit={() => {

          const name = formName.trim();

          if (name) createMutation.mutate({ name, color: formColor });

        }}

        submitLabel="Criar"

        submitDisabled={!formName.trim()}

        isPending={createMutation.isPending}

      >

        <div>

          <label className="text-sm font-medium">Nome</label>

          <Input

            className="mt-1"

            value={formName}

            onChange={(e) => setFormName(e.target.value)}

            placeholder="Ex: ecommerce"

            autoFocus

          />

        </div>

        <div>

          <label className="text-sm font-medium">Cor</label>

          <div className="mt-2 flex flex-wrap gap-2">

            {TAG_COLORS.map((color) => (

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



export function TagBadges({ tags }: { tags: { id: string; name: string; color: string }[] }): React.ReactElement {

  if (!tags.length) return <span className="text-xs text-muted-foreground">—</span>;



  return (

    <div className="flex flex-wrap gap-1">

      {tags.map((tag) => (

        <span

          key={tag.id}

          className="rounded-full px-2 py-0.5 text-[10px] font-medium"

          style={{ backgroundColor: `${tag.color}22`, color: tag.color }}

        >

          {tag.name}

        </span>

      ))}

    </div>

  );

}



export function TagPicker({

  selectedIds,

  onChange,

}: {

  selectedIds: string[];

  onChange: (ids: string[]) => void;

}): React.ReactElement {

  const { data: tags = [] } = useQuery({

    queryKey: ['tags'],

    queryFn: () => window.polaris.tags.list(),

  });



  const toggle = (id: string): void => {

    if (selectedIds.includes(id)) {

      onChange(selectedIds.filter((t) => t !== id));

    } else {

      onChange([...selectedIds, id]);

    }

  };



  if (!tags.length) {

    return <p className="text-xs text-muted-foreground">Nenhuma tag — crie na barra de filtros.</p>;

  }



  return (

    <div className="flex flex-wrap gap-2">

      {tags.map((tag) => {

        const selected = selectedIds.includes(tag.id);

        return (

          <button

            key={tag.id}

            type="button"

            onClick={() => toggle(tag.id)}

            className={cn(

              'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',

              selected && 'ring-2 ring-primary ring-offset-1 ring-offset-background',

            )}

            style={{

              backgroundColor: `${tag.color}22`,

              color: tag.color,

              border: `1px solid ${tag.color}44`,

            }}

          >

            {tag.name}

          </button>

        );

      })}

    </div>

  );

}

