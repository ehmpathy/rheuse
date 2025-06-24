import { Image, ImageContentPositionString } from 'expo-image';
import { createIsOfEnum } from 'type-fns';

import { Block } from '../foundation/Block/Block';
import { BlockSizeInput } from '../foundation/Block/BlockSizeInput';
import { Border } from '../foundation/Border';

const PrimitiveImage = Image; // TODO: make this isomorphic by detecting the environment. or maybe through provider.context

export enum PictureFocalArea {
  TOP_RIGHT = 'TOP_RIGHT',
  TOP_CENTER = 'TOP_CENTER',
  TOP_LEFT = 'TOP_LEFT',
  CENTER_RIGHT = 'CENTER_RIGHT',
  CENTER_CENTER = 'CENTER_CENTER',
  CENTER_LEFT = 'CENTER_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
}
export const isOfPictureFocalArea = createIsOfEnum(PictureFocalArea);

export const castPictureFocalAreaToObjectPosition = (
  position: PictureFocalArea,
): ImageContentPositionString =>
  position.replace('_', ' ').toLowerCase() as ImageContentPositionString;

/**
 * a border that can be displayed for a picture
 */
export interface PictureBorder {
  radius?: number;
  outline?: Parameters<typeof Border>[0]['outline'];
}

/**
 * a reusable component for displaying a picture a user (a.k.a. image)
 */
export const Picture = ({
  uri,
  description,
  size,
  fit = 'cover',
  focal,
  border = { radius: 5 },
  onSize,
}: {
  /**
   * where the image can be found
   */
  uri: string;

  /**
   * the focal area of the picture to display
   *
   * note
   * - this affects which part of the picture will be in view in case the full picture can not be displayed
   * - under the hood, this modifies the object-position of the picture being displayed
   */
  focal?: PictureFocalArea | null;

  /**
   * a description of the image being displayed
   *
   * note
   * - this affects the accessibility of the image by setting the description which will be read aloud to screen readers
   */
  description?: string | null;

  /**
   * how the image should fit within the specified size
   *
   * for example
   * - "cover" to ensure the image covers the full size (overflow will be hidden outside of boundaries)
   * - "contain" to ensure the whole image is visible as large as possible within the size (blank space will be within the size if aspect ratios dont match)
   */
  fit?: 'contain' | 'cover';

  size?: BlockSizeInput;

  border?: PictureBorder;

  onSize?: Parameters<typeof Block>['0']['onSize'];
}) => {
  // render the element
  return (
    <Border
      radius={border.radius ?? 5}
      padding={null}
      outline={
        border.outline !== undefined
          ? border.outline
          : fit === 'contain'
          ? null // dont show border on "contain" since the image will be smaller than the border
          : undefined
      }
      size={size}
      onSize={onSize}
    >
      <Block
        overlayable // overlayable so that we can overlay the image across its full size w/ relative sizing
        size="fill"
      >
        <PrimitiveImage
          source={{ uri }}
          alt={description ?? undefined}
          contentFit={fit} // !: required for native for "cover"
          contentPosition={
            focal ? castPictureFocalAreaToObjectPosition(focal) : undefined
          }
          style={{
            objectFit: fit, // !: required for browser and native for "contain"
            width: '100%', // 100% of the block it will overlay
            height: '100%', // 100% of the block it will overlay
          }}
        />
      </Block>
    </Border>
  );
};
