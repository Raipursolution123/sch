import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Switch } from '@components/ui/switch';
import type { CreateCoursePayload } from '@app-types/lms';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';

const courseSchema = z.object({
  title: z.string().min(3, 'Title is required (min 3 characters)'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  discount: z.coerce.number().min(0).max(100, 'Discount must be between 0 and 100'),
  free_course: z.boolean(),
  front_side_visibility: z.boolean(),
  status: z.coerce.number(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialValues?: Partial<CreateCoursePayload>;
  onSubmit: (values: CreateCoursePayload) => void;
  isSubmitting?: boolean;
}

export function CourseForm({ initialValues, onSubmit, isSubmitting }: CourseFormProps) {
  const navigate = useNavigate();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as Resolver<CourseFormValues>,
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      price: initialValues?.price || 0,
      discount: initialValues?.discount || 0,
      free_course: initialValues?.free_course === 1,
      front_side_visibility: initialValues?.front_side_visibility !== 'no',
      status: initialValues?.status ?? 1,
    },
  });

  const handleSubmit = (values: CourseFormValues) => {
    onSubmit({
      ...values,
      free_course: values.free_course ? 1 : 0,
      front_side_visibility: values.front_side_visibility ? 'yes' : 'no',
      price: values.free_course ? 0 : (values.price ?? 0),
      discount: values.free_course ? 0 : (values.discount ?? 0),
    });
  };

  return (
    <div className="max-w-3xl rounded-xl border bg-card text-card-foreground shadow">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold leading-none tracking-tight">
          {initialValues ? 'Edit Course' : 'Create New Course'}
        </h3>
      </div>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form id="course-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter course description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={form.watch('free_course')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={form.watch('free_course')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="free_course"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Free Course</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="front_side_visibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Visible on Frontend</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <div className="flex items-center justify-between p-6 pt-0">
        <Button variant="outline" onClick={() => navigate(ROUTES.lms.courses.root)}>
          Cancel
        </Button>
        <Button type="submit" form="course-form" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialValues ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </div>
  );
}
