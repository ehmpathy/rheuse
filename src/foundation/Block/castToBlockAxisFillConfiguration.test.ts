import { given, when, then } from 'test-fns';

import { BlockAxis } from './BlockAxis';
import { BlockSize } from './BlockSize';
import { ParentBlockConfiguration } from './ParentBlockConfiguration';
import { castToBlockAxisFillConfiguration } from './castToBlockAxisFillConfiguration';

describe('castToBlockAxisFillConfiguration', () => {
  given('parent.primary.axis is vertical', () => {
    const axis = { primary: BlockAxis.VERTICAL };

    given('parent is fillable in both axis, via grow', () => {
      const fillable = {
        horizontally: { grow: true as const },
        vertically: { grow: true as const },
      };

      when('size asks to fill on height', () => {
        const size: BlockSize = { mag: { height: 'fill' } };

        then(
          'fill should be enabled on primary',
          {
            because: 'parent is fillable in this axis and it was requested',
          },
          () => {
            const fill = castToBlockAxisFillConfiguration({
              parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
              size,
            });

            expect(fill.relative).toMatchObject({ primary: true });
          },
        );
        then(
          'fill should be disabled on secondary',
          { because: 'size didnt request filling on this axis' },
          () => {
            const fill = castToBlockAxisFillConfiguration({
              parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
              size,
            });
            expect(fill.relative).toMatchObject({ secondary: false });
          },
        );
      });

      when('size asks to fill on width', () => {
        const size: BlockSize = { mag: { width: 'fill' } };

        then(
          'fill should be enabled on secondary',
          { because: 'parent is fillable in this axis and fill was requested' },
          () => {
            const fill = castToBlockAxisFillConfiguration({
              parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
              size,
            });
            expect(fill.relative).toMatchObject({ secondary: true });
          },
        );

        then(
          'fill should be disabled on primary',
          { because: 'size didnt request filling on this axis' },
          () => {
            const fill = castToBlockAxisFillConfiguration({
              parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
              size,
            });
            expect(fill.relative).toMatchObject({ primary: false });
          },
        );
      });

      when('size asks to fill on both', () => {
        const size: BlockSize = { mag: { width: 'fill', height: 'fill' } };

        then(
          'fill should be enabled on primary',
          { because: 'parent is fillable in this axis and fill was requested' },
          () => {
            const fill = castToBlockAxisFillConfiguration({
              parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
              size,
            });
            expect(fill.relative).toMatchObject({ primary: true });
          },
        );

        then(
          'fill should be enabled on secondary',
          { because: 'size didnt request filling on this axis' },
          () => {
            const fill = castToBlockAxisFillConfiguration({
              parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
              size,
            });
            expect(fill.relative).toMatchObject({ secondary: true });
          },
        );
      });
    });

    given('parent is fillable horizontally only, via grow', () => {
      const fillable = {
        horizontally: { grow: true as const },
        vertically: false,
      };

      when('size asks to fill on both axis', () => {
        const size: BlockSize = { mag: { width: 'fill', height: 'fill' } };
        const fill = castToBlockAxisFillConfiguration({
          parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
          size,
        });

        then(
          'fill should be disabled on primary',
          { because: 'parent is not fillable in the primary axis' },
          () => {
            expect(fill.relative).toMatchObject({ primary: false });
          },
        );

        then(
          'fill should be enabled on secondary',
          {
            because: 'parent is fillable on this axis and it was requested',
          },
          () => {
            expect(fill.relative).toMatchObject({ secondary: true });
          },
        );
      });
    });

    given('parent is fillable in both axis, via min', () => {
      const fillable = {
        horizontally: { min: 821 },
        vertically: { min: 821 },
      };

      when('size asks to fill on both axis', () => {
        const size: BlockSize = { mag: { width: 'fill', height: 'fill' } };
        const fill = castToBlockAxisFillConfiguration({
          parent: { axis, fillable } as ParentBlockConfiguration, // omit the 'center' configuration as its unnecessary
          size,
        });

        then(
          'fill should be disabled on primary',
          {
            because: 'it is safe to flex fill even when fillable only via min',
          },
          () => {
            expect(fill.relative).toMatchObject({ primary: true });
          },
        );

        then(
          'fill should be enabled on secondary',
          {
            because: 'secondary axis is always safely fillable',
          },
          () => {
            expect(fill.relative).toMatchObject({ secondary: true });
          },
        );
      });
    });
  });
});
