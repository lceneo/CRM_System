import {ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, signal} from '@angular/core';
import {IComment} from "../../../../helpers/entities/IComment";
import {ProfileService} from "../../../../../../shared/services/profile.service";
import {FormControl} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {ModalDeleteTaskCommentComponent} from "../modal-delete-task-comment/modal-delete-task-comment.component";
import {debounceTime, filter, map, pipe, switchMap} from "rxjs";
import {TaskService} from "../../../../services/task.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-task-comment',
  templateUrl: './task-comment.component.html',
  styleUrls: ['./task-comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCommentComponent implements OnInit{

  constructor(
    private taskS: TaskService,
    private profileS: ProfileService,
    private matDialog: MatDialog,
    private destroyRef: DestroyRef
  ) {}

 @Input({required: true}) set comment(value: IComment) {
    this._comment = value;
    this.commentTextControl.setValue(value.text);
 }

 @Input({required: true}) taskID?: string;

 get comment(): IComment | undefined {
   return this._comment;
 }

 private _comment?: IComment;
 protected profileID = this.profileS.profile()?.id;

 protected commentTextControl = new FormControl<string>('');

 protected commentMode: CommentModeType = 'view';

 protected editBtnDisabled = signal(true);

  ngOnInit(): void {
    this.setCommentControlInitialState();
  }

  protected toggleCommentMode() {
    if (this.commentMode === 'view') {
      this.commentTextControl.enable({emitEvent: false});
      this.commentMode = 'edit';
    } else {
      this.commentTextControl.disable({emitEvent: false});
      this.commentMode = 'view';
    }
  }

  protected updateComment(taskID: string, commentID: string, commentText: string) {
    this.taskS.updateCommentHTTP$(taskID, {id: commentID, text: commentText})
      .subscribe();
  }

  protected deleteComment(taskID: string, commentID: string) {
    this.matDialog.open(ModalDeleteTaskCommentComponent, {data: commentID, autoFocus: false})
      .afterClosed()
      .pipe(
          filter(toDelete => !!toDelete),
          switchMap(() => this.taskS.deleteCommentHTTP$(taskID, commentID))
        )
      .subscribe();
  }

  private setCommentControlInitialState() {
    this.commentTextControl.disable({emitEvent: false});

    this.commentTextControl.valueChanges
      .pipe(
        debounceTime(200),
        filter(value => !!value),
        map((value) => value!.trim() === this.comment?.text),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(isTheSame => this.editBtnDisabled.set(isTheSame));
  }
}

type CommentModeType = 'view' | 'edit';
