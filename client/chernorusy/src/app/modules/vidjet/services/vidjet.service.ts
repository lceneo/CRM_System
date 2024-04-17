import { Injectable } from '@angular/core';
import {EntityStateManager} from "../../../shared/helpers/entityStateManager";
import {IVidjet} from "../entities/Vidjet";
import {IVidjetPOSTResponseDTO} from "../DTO/response/VidjetPOSTResponseDTO";
import {IVidjetPOSTRequestDTO} from "../DTO/request/VidjetPOSTRequestDTO";
import {tap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class VidjetService extends EntityStateManager<IVidjet> {



  protected override initMethod = '/Vidjets';
  protected override mapFn = (res: {items: IVidjet[]}) => {
    res.items.forEach(item => item.styles = typeof item.styles === 'string' ? JSON.parse(item.styles) : item.styles);
    return res.items;
  }

  public readonly defaultStyles: Customization = {
    comeMsg: {
      bgc: 'orange',
      padding: '5px 5px 5px 5px',
      side: 'center',
      content: {
        align: 'center',
        size: 14,
        type: 'px',
        color: 'black',
        lineHeight: 1
      },
    },
    mngMsg: {
      bgc: 'lightblue',
      padding: '5px 5px 5px 5px',
      side: 'left',
      time: {
        align: 'right',
        size: 7,
        type: 'px',
        color: 'black',
        lineHeight: 1
      },
      content: {
        align: 'left',
        size: 14,
        type: 'px',
        color: 'black',
        lineHeight: 1
      },
    },
    userMsg: {
      bgc: 'lightgreen',
      padding: '5px 5px 5px 5px',
      side: 'right',
      time: {
        align: 'right',
        size: 7,
        type: 'px',
        color: 'black',
        lineHeight: 1
      },
      content: {
        align: 'left',
        size: 14,
        type: 'px',
        color: 'black',
        lineHeight: 1
      },
    },
    content: {
      bgc: 'lightgrey',
      padding: '5px 5px 5px 5px',
    },
    footer: {
      bgc: 'black',
      padding: '5px 5px 5px 5px',
    },
    header: {
      bgc:'black',
      padding: '5px 5px 5px 5px',
    },
    online: {color: {offline: "", online: ""}, show: false, size: 0},
    position: {X: {side: 'left', move: 0, moveType: 'px'}, Y: {side: 'bottom', move: 0, moveType: 'px'}},
  }

  constructor() {
    super();
  }

  protected override initial() {
    this.initStore();
  }


  public createOrUpdateVidjet(vidjet: IVidjetPOSTRequestDTO) {
    return this.httpS.post<IVidjetPOSTResponseDTO>('/Vidjets', vidjet)
      .pipe(
        tap((res) => {
          'id' in vidjet ? this.updateByID(vidjet.id as string, {domen: vidjet.domen})
              //@ts-ignore
            : this.upsertEntities([{...vidjet, id: res.id}]);
        })
      )
  }

  public getStyles() {

  }

  public deleteVidjet(id: string) {
    return this.httpS.delete(`/Vidjets/${id}`)
      .pipe(
        tap(() => this.removeByID(id))
      );
  }

}



export interface Customization {
  position: {
    X: CustomizationPosition<'left' | 'right'>,
    Y: CustomizationPosition<'top' | 'bottom'>,
  }
  header: DefaultSection,
  footer: DefaultSection,
  content: DefaultSection,
  userMsg: DefaultMessage,
  mngMsg: DefaultMessage,
  comeMsg: Omit<DefaultMessage, 'time'>,
  online: {
    color: {
      online: string,
      offline: string,
    },
    size: number,
    show: boolean
  }
}

export interface DefaultMessage extends DefaultSection {
  content: Font & {
    align: 'left' | 'center' | 'right'
  },
  time: Font & {
    align: 'left' | 'center' | 'right'
  },
  side: 'left' | 'center' | 'right'
}

export interface DefaultSection {
  bgc: string
  padding: string
}

interface Font {
  size: number,
  type: 'em' | 'px' | 'rem'
  color: string
  lineHeight: number
}

interface CustomizationPosition<TSide extends 'left' | 'right' | 'top' | 'bottom'> {
  side: TSide
  move: number
  moveType: 'px' | '%'
}
