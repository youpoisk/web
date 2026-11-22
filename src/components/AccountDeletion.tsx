import React,{useRef}from'react';

/** Irreversible account deletion needs an explicit confirmation with a safe
 * default: the dialog opens with «Отмена» focused, so Enter or Escape cancels.
 * Confirming only continues to the API-origin password page; nothing is deleted
 * from this screen. */
export function AccountDeletionButton({onConfirm}:{onConfirm:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null);
 function open(){const node=dialog.current;if(!node)return;node.showModal();cancel.current?.focus();}
 function close(){dialog.current?.close();}
 return <>
  <button type="button" className="secondary" aria-haspopup="dialog" onClick={open}>Удалить аккаунт…</button>
  <dialog ref={dialog} className="confirm-dialog" aria-labelledby="delete-account-title" aria-describedby="delete-account-description" onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close();}}>
   <div className="confirm-dialog-content">
    <h2 id="delete-account-title">Удалить аккаунт?</h2>
    <p id="delete-account-description">Аккаунт удаляется безвозвратно: пропадут оценки, рецензии, списки, друзья, подписки и переписки. Следующий шаг — подтверждение пароля на защищённой странице YouPoisk. До него ничего не удаляется.</p>
    <div className="actions"><button ref={cancel} type="button" className="primary" autoFocus onClick={close}>Отмена</button><button type="button" className="secondary danger-button" onClick={()=>{close();onConfirm();}}>Продолжить удаление…</button></div>
   </div>
  </dialog>
 </>;
}
