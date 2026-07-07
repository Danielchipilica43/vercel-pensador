import { Toaster, toast } from "sonner";

export default function Demo(){
    return(
        <div>
            <Toaster/>
            <button onClick={()=> toast("clicou")}>

            </button>
        </div>
    )
} 